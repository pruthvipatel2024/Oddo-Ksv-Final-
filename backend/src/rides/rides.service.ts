import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Ride, RideStatus, VehicleVerificationStatus } from '@prisma/client';
import { RidesRepository } from './rides.repository';
import { CreateRideDto } from './dto/create-ride.dto';
import { SearchRideDto } from './dto/search-ride.dto';
import { ConfirmRouteDto } from './dto/confirm-route.dto';
import { MapsService } from '../maps/maps.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { RatingsService } from '../ratings/ratings.service';

@Injectable()
export class RidesService {
  private readonly logger = new Logger('RidesService');

  constructor(
    private readonly ridesRepository: RidesRepository,
    private readonly mapsService: MapsService,
    private readonly vehiclesService: VehiclesService,
    private readonly ratingsService: RatingsService,
  ) {}

  /**
   * Required route confirmation step. Computes route, polyline, distance, and duration.
   */
  async confirmRoute(dto: ConfirmRouteDto) {
    const route = await this.mapsService.getRoute(
      dto.pickupLat,
      dto.pickupLng,
      dto.destinationLat,
      dto.destinationLng,
    );

    return {
      success: true,
      data: route,
    };
  }

  /**
   * Offer / Publish a new ride.
   */
  async create(
    driverId: string,
    organizationId: string,
    dto: CreateRideDto,
  ): Promise<Ride> {
    // 1. Verify driver has registered the vehicle and it is active & verified
    const vehicle = await this.vehiclesService.findByIdScoped(
      dto.vehicleId,
      organizationId,
    );

    if (vehicle.ownerId !== driverId) {
      throw new ForbiddenException('You do not own this vehicle');
    }

    if (!vehicle.isActive) {
      throw new BadRequestException(
        'This vehicle is currently marked inactive',
      );
    }

    if (vehicle.verificationStatus !== VehicleVerificationStatus.VERIFIED) {
      throw new BadRequestException(
        'Vehicle must be verified by admin before offering rides',
      );
    }

    // 2. Enforce seating capacity constraint
    if (dto.availableSeats > vehicle.seatingCapacity) {
      throw new BadRequestException(
        `Seating capacity of this vehicle is limited to ${vehicle.seatingCapacity} passenger seats`,
      );
    }

    // 3. Compute route details (caching the actual polyline & distance)
    const route = await this.mapsService.getRoute(
      dto.pickupLat,
      dto.pickupLng,
      dto.destinationLat,
      dto.destinationLng,
    );

    // Fuel Cost logic: Standard marketplace calculation (100 INR fuel per litre, 14 km/litre mileage)
    const distanceKm = route.distanceMeters / 1000;
    const averageMileage = 14;
    const fuelUsedLitres = distanceKm / averageMileage;
    const fuelRate = 100;
    const estimatedFuelCost = Number((fuelUsedLitres * fuelRate).toFixed(2));

    // 4. Save the ride
    return this.ridesRepository.create({
      pickupAddress: dto.pickupAddress,
      pickupLat: dto.pickupLat,
      pickupLng: dto.pickupLng,
      pickupPlaceId: dto.pickupPlaceId || null,
      destinationAddress: dto.destinationAddress,
      destinationLat: dto.destinationLat,
      destinationLng: dto.destinationLng,
      destinationPlaceId: dto.destinationPlaceId || null,
      routePolyline: route.polyline,
      routeDistanceMeters: route.distanceMeters,
      routeDurationSeconds: route.durationSeconds,
      estimatedFuelCost,
      date: new Date(dto.date),
      time: dto.time,
      availableSeats: dto.availableSeats,
      farePerSeat: dto.farePerSeat,
      recurring: dto.recurring || false,
      status: RideStatus.OPEN,
      vehicleType: `${vehicle.manufacturer} ${vehicle.model}`,
      organizationId,
      driverId,
      vehicleId: dto.vehicleId,
    });
  }

  /**
   * Find a specific ride by ID.
   */
  async findById(id: string): Promise<Ride> {
    return this.ridesRepository.findById(id);
  }

  /**
   * Find detailed ride properties, including bookings and driver profiles.
   */
  async findDetail(id: string, organizationId?: string): Promise<any> {
    const ride = await this.ridesRepository.findDetailById(id);
    if (!ride) {
      throw new NotFoundException('Ride profile not found');
    }
    return ride;
  }

  /**
   * Search and match rides globally across the marketplace, isolated by passenger organization.
   */
  async search(organizationId: string, dto: SearchRideDto): Promise<any[]> {
    const travelDate = new Date(dto.date);

    // Fetch all open rides on that date globally, scoped to the passenger's org
    const openRides = await this.ridesRepository.findMatchingRides(
      organizationId,
      travelDate,
      RideStatus.OPEN,
    );

    // Helper to extract calendar day string YYYY-MM-DD in IST (+5:30 offset)
    const toLocalDateString = (d: Date) => {
      const offsetMs = 5.5 * 60 * 60 * 1000;
      const localDate = new Date(d.getTime() + offsetMs);
      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localDate.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const searchDayStr = toLocalDateString(travelDate);

    // Compute target departure total minutes from midnight
    const searchDateTime = new Date(dto.date);
    const searchHours = searchDateTime.getUTCHours();
    const searchMinutesTotal =
      searchHours * 60 + searchDateTime.getUTCMinutes();

    const matches: any[] = [];

    for (const ride of openRides) {
      console.log(`Checking ride: ${ride.id}`);
      // 0. Verify matching calendar day in local time offset (IST)
      const rideDayStr = toLocalDateString(new Date(ride.date));
      console.log(`  - searchDayStr: ${searchDayStr}, rideDayStr: ${rideDayStr}`);
      if (searchDayStr !== rideDayStr) {
        console.log('  -> Date mismatch');
        continue;
      }

      // 1. Check seat availability
      const seatsNeeded = dto.seatsNeeded || 1;
      console.log(`  - seatsNeeded: ${seatsNeeded}, availableSeats: ${ride.availableSeats}`);
      if (ride.availableSeats < seatsNeeded) {
        console.log('  -> Seat mismatch');
        continue;
      }

      // 2. Check maximum price constraint
      console.log(`  - maxPrice: ${dto.maxPrice}, farePerSeat: ${ride.farePerSeat}`);
      if (dto.maxPrice && Number(ride.farePerSeat) > dto.maxPrice) {
        console.log('  -> Price mismatch');
        continue;
      }

      // 3. Check vehicle type constraint
      if (dto.vehicleType && ride.vehicleType) {
        const vehicleMatch = ride.vehicleType
          .toLowerCase()
          .includes(dto.vehicleType.toLowerCase());
        console.log(`  - vehicleType: ${dto.vehicleType}, rideVehicleType: ${ride.vehicleType}, match: ${vehicleMatch}`);
        if (!vehicleMatch) {
          console.log('  -> Vehicle mismatch');
          continue;
        }
      }

      // 4. Calculate pickup proximity along the driver's route
      const pickupProjection = this.projectPointToLineSegment(
        dto.pickupLat, dto.pickupLng,
        Number(ride.pickupLat), Number(ride.pickupLng),
        Number(ride.destinationLat), Number(ride.destinationLng)
      );
      
      const exactPickupDistance = this.haversineDistance(
        Number(ride.pickupLat), Number(ride.pickupLng), 
        dto.pickupLat, dto.pickupLng
      );
      
      // Minimum of exact distance or distance to the line segment
      const pickupDistance = Math.min(pickupProjection.distance, exactPickupDistance);
      const pickupRadiusLimit = dto.pickupRadius ?? 20000; // Increased to 20km for realistic intercity detours
      
      console.log(`  - pickupDistance: ${pickupDistance}, limit: ${pickupRadiusLimit}`);
      if (pickupDistance > pickupRadiusLimit) {
        console.log('  -> Pickup proximity mismatch');
        continue;
      }

      // 5. Calculate destination proximity along the driver's route
      const destProjection = this.projectPointToLineSegment(
        dto.destinationLat, dto.destinationLng,
        Number(ride.pickupLat), Number(ride.pickupLng),
        Number(ride.destinationLat), Number(ride.destinationLng)
      );
      
      const exactDestDistance = this.haversineDistance(
        Number(ride.destinationLat), Number(ride.destinationLng), 
        dto.destinationLat, dto.destinationLng
      );
      
      const destDistance = Math.min(destProjection.distance, exactDestDistance);
      const destRadiusLimit = dto.destinationRadius ?? 20000;

      console.log(`  - destDistance: ${destDistance}, limit: ${destRadiusLimit}`);
      if (destDistance > destRadiusLimit) {
        console.log('  -> Destination proximity mismatch');
        continue;
      }

      // 5.5 Check directionality (passenger must travel in the same direction as the driver)
      if (pickupProjection.param > destProjection.param + 0.05) {
         console.log('  -> Direction mismatch (passenger traveling backwards)');
         continue;
      }

      // 6. Check time window (default to 24 hours to cover any same-day commute)
      const [rideH, rideM] = ride.time.split(':').map(Number);
      const rideMinutesTotal = rideH * 60 + rideM;
      const timeDiff = Math.abs(rideMinutesTotal - searchMinutesTotal);
      console.log(`  - rideTime: ${ride.time} (${rideMinutesTotal}m), searchTimeMinutes: ${searchMinutesTotal}m, diff: ${timeDiff}, limit: ${dto.timeWindowMinutes ?? 1440}`);

      if (timeDiff > (dto.timeWindowMinutes ?? 1440)) {
        console.log('  -> Time window mismatch');
        continue;
      }

      // 7. Get driver average rating
      const driverRating = await this.ratingsService.getAverageRating(
        ride.driverId,
      );
      if (dto.minDriverRating && driverRating < dto.minDriverRating) {
        continue;
      }

      // Proximity match passed - compile metrics
      matches.push({
        ...ride,
        metrics: {
          pickupDistance,
          destDistance,
          totalDetour: pickupDistance + destDistance,
          timeDifference: timeDiff,
          driverRating,
        },
      });
    }

    // Sort by best match: 
    // 1. Closest time difference (prioritize rides matching the exact requested time)
    // 2. Lowest total detour distance
    // 3. Highest driver rating
    // 4. Lowest price
    matches.sort((a, b) => {
      // Sort by time difference (ascending)
      const timeDiff = a.metrics.timeDifference - b.metrics.timeDifference;
      if (timeDiff !== 0) return timeDiff;

      // Sort by detour distance (ascending)
      const detourDiff = a.metrics.totalDetour - b.metrics.totalDetour;
      if (detourDiff !== 0) return detourDiff;

      const ratingDiff = b.metrics.driverRating - a.metrics.driverRating;
      if (ratingDiff !== 0) return ratingDiff;

      return Number(a.farePerSeat) - Number(b.farePerSeat);
    });

    return matches;
  }

  /**
   * Cancel offered ride.
   */
  async cancel(id: string, driverId: string): Promise<Ride> {
    const ride = await this.ridesRepository.findById(id);
    if (ride.driverId !== driverId) {
      throw new ForbiddenException('You did not publish this ride');
    }

    if (ride.status === RideStatus.CANCELLED) {
      throw new BadRequestException('This ride is already cancelled');
    }

    if (
      ride.status === RideStatus.COMPLETED ||
      ride.status === RideStatus.STARTED
    ) {
      throw new BadRequestException(
        'Cannot cancel a ride that has already started or completed',
      );
    }

    return this.ridesRepository.update(id, { status: RideStatus.CANCELLED });
  }

  /**
   * Helper utility calculating geographic distance in meters between two coordinates.
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Project a point onto a line segment and return the distance in meters and the projection parameter [0, 1].
   * This is used to check if a passenger's pickup/destination is along the driver's route.
   */
  private projectPointToLineSegment(
    ptLat: number, ptLng: number,
    startLat: number, startLng: number,
    endLat: number, endLng: number
  ) {
    const x = ptLng, y = ptLat;
    const x1 = startLng, y1 = startLat;
    const x2 = endLng, y2 = endLat;

    const C = x2 - x1;
    const D = y2 - y1;
    const len_sq = C * C + D * D;
    
    let param = 0;
    if (len_sq !== 0) {
      param = ((x - x1) * C + (y - y1) * D) / len_sq;
    }

    // Clamp param to [0, 1] for the line segment bounds
    const clampedParam = Math.max(0, Math.min(1, param));
    const xx = x1 + clampedParam * C;
    const yy = y1 + clampedParam * D;

    const dx = x - xx;
    const dy = y - yy;
    
    // Distance in degrees converted to meters (approx 111km per degree)
    const distanceMeters = Math.sqrt(dx * dx + dy * dy) * 111000;
    
    return { distance: distanceMeters, param };
  }

  /**
   * Find all rides published by a specific driver, including associated vehicle and bookings.
   */
  async findByDriver(driverId: string): Promise<any[]> {
    return this.ridesRepository.findByDriverId(driverId);
  }
}
