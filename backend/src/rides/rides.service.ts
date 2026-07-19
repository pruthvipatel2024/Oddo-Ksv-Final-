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

    // Compute target departure total minutes from midnight
    const searchDateTime = new Date(dto.date);
    const searchHours = searchDateTime.getUTCHours();
    const searchMinutesTotal =
      searchHours * 60 + searchDateTime.getUTCMinutes();

    const matches: any[] = [];

    for (const ride of openRides) {
      // 1. Check seat availability
      const seatsNeeded = dto.seatsNeeded || 1;
      if (ride.availableSeats < seatsNeeded) {
        continue;
      }

      // 2. Check maximum price constraint
      if (dto.maxPrice && Number(ride.farePerSeat) > dto.maxPrice) {
        continue;
      }

      // 3. Check vehicle type constraint
      if (dto.vehicleType && ride.vehicleType) {
        const vehicleMatch = ride.vehicleType
          .toLowerCase()
          .includes(dto.vehicleType.toLowerCase());
        if (!vehicleMatch) {
          continue;
        }
      }

      // 4. Calculate pickup proximity
      const pickupDistance = this.haversineDistance(
        Number(ride.pickupLat),
        Number(ride.pickupLng),
        dto.pickupLat,
        dto.pickupLng,
      );

      const pickupRadiusLimit = dto.pickupRadius ?? 2000;
      if (pickupDistance > pickupRadiusLimit) {
        continue;
      }

      // 5. Calculate destination proximity
      const destDistance = this.haversineDistance(
        Number(ride.destinationLat),
        Number(ride.destinationLng),
        dto.destinationLat,
        dto.destinationLng,
      );

      const destRadiusLimit = dto.destinationRadius ?? 2000;
      if (destDistance > destRadiusLimit) {
        continue;
      }

      // 6. Check time window
      const [rideH, rideM] = ride.time.split(':').map(Number);
      const rideMinutesTotal = rideH * 60 + rideM;
      const timeDiff = Math.abs(rideMinutesTotal - searchMinutesTotal);

      if (timeDiff > (dto.timeWindowMinutes ?? 30)) {
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
          driverRating,
        },
      });
    }

    // Sort by best match (lowest total detour distance, then highest driver rating, then lowest price)
    matches.sort((a, b) => {
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

    return R * c;
  }

  /**
   * Find all rides published by a specific driver, including associated vehicle and bookings.
   */
  async findByDriver(driverId: string): Promise<any[]> {
    return this.ridesRepository.findByDriverId(driverId);
  }
}
