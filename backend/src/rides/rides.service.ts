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
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class RidesService {
  private readonly logger = new Logger('RidesService');

  constructor(
    private readonly ridesRepository: RidesRepository,
    private readonly mapsService: MapsService,
    private readonly vehiclesService: VehiclesService,
    private readonly orgsService: OrganizationsService,
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
  async create(driverId: string, organizationId: string, dto: CreateRideDto): Promise<Ride> {
    // 1. Verify driver has registered the vehicle and it is active & verified
    const vehicle = await this.vehiclesService.findByIdScoped(dto.vehicleId, organizationId);
    
    if (vehicle.ownerId !== driverId) {
      throw new ForbiddenException('You do not own this vehicle');
    }

    if (!vehicle.isActive) {
      throw new BadRequestException('This vehicle is currently marked inactive');
    }

    if (vehicle.verificationStatus !== VehicleVerificationStatus.VERIFIED) {
      throw new BadRequestException('Vehicle must be verified by admin before offering rides');
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

    // 4. Retrieve organization settings to compute estimated fuel costs
    const org = await this.orgsService.findById(organizationId);
    
    // Fuel Cost logic: Assume average mileage is 14 km per litre
    const distanceKm = route.distanceMeters / 1000;
    const averageMileage = 14;
    const fuelUsedLitres = distanceKm / averageMileage;
    // fuelCostPerLitre is a Decimal from Prisma, convert to number
    const fuelRate = Number(org.fuelCostPerLitre);
    const estimatedFuelCost = Number((fuelUsedLitres * fuelRate).toFixed(2));

    // 5. Save the ride
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
      organizationId,
      driverId,
      vehicleId: dto.vehicleId,
    });
  }

  /**
   * Find a specific ride by ID. Enforces organization scope.
   */
  async findById(id: string, organizationId?: string): Promise<Ride> {
    return this.ridesRepository.findById(id, organizationId);
  }

  /**
   * Find detailed ride properties, including bookings and driver profiles.
   */
  async findDetail(id: string, organizationId?: string): Promise<any> {
    const ride = await this.ridesRepository.findDetailById(id, organizationId);
    if (!ride) {
      throw new NotFoundException('Ride profile not found');
    }
    return ride;
  }

  /**
   * Search and match rides using haversine proximity thresholds (2 km radius).
   */
  async search(organizationId: string, dto: SearchRideDto): Promise<Ride[]> {
    const travelDate = new Date(dto.date);
    
    // Fetch all open rides in organization on that date
    const openRides = await this.ridesRepository.findMatchingRides(organizationId, travelDate, RideStatus.OPEN);

    // Apply geographic haversine proximity filtering (max 2 km detour distance)
    const matchedRides = openRides.filter((ride) => {
      // 1. Check seat availability
      const seatsNeeded = dto.seatsNeeded || 1;
      if (ride.availableSeats < seatsNeeded) {
        return false;
      }

      // 2. Calculate distance between search pickup and ride pickup
      const pickupDistance = this.haversineDistance(
        Number(ride.pickupLat),
        Number(ride.pickupLng),
        dto.pickupLat,
        dto.pickupLng,
      );

      // 3. Calculate distance between search destination and ride destination
      const destDistance = this.haversineDistance(
        Number(ride.destinationLat),
        Number(ride.destinationLng),
        dto.destinationLat,
        dto.destinationLng,
      );

      // Match only if both points are within 2000 meters
      return pickupDistance <= 2000 && destDistance <= 2000;
    });

    return matchedRides;
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

    if (ride.status === RideStatus.COMPLETED || ride.status === RideStatus.STARTED) {
      throw new BadRequestException('Cannot cancel a ride that has already started or completed');
    }

    return this.ridesRepository.update(id, { status: RideStatus.CANCELLED });
  }

  /**
   * Helper utility calculating geographic distance in meters between two coordinates.
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
