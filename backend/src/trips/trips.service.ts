import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Trip, TripStatus, RideStatus, UserRole } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TripsRepository } from './trips.repository';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TripsService {
  private readonly logger = new Logger('TripsService');

  constructor(
    private readonly tripsRepository: TripsRepository,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get detailed trip details. Enforces organization isolation.
   */
  async findById(id: string, organizationId?: string): Promise<any> {
    const trip = await this.tripsRepository.findDetailById(id, organizationId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }

  /**
   * Find trips in which a specific user participates (either as Driver or Passenger).
   */
  async findByUser(userId: string): Promise<Trip[]> {
    return this.tripsRepository.findByParticipantId(userId);
  }

  /**
   * Transition trip lifecycle state. Enforces one-directional constraints and logs audits.
   */
  async updateStatus(
    id: string,
    userId: string,
    organizationId: string,
    dto: UpdateTripStatusDto,
  ): Promise<Trip> {
    const trip = await this.tripsRepository.findDetailById(id, organizationId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const currentStatus = trip.status;
    const targetStatus = dto.status;

    // 1. Enforce driver authorization for operations (only driver can start/complete/cancel)
    const isDriver = trip.ride.driverId === userId;
    
    if (!isDriver && targetStatus !== TripStatus.PAYMENT_COMPLETED && targetStatus !== TripStatus.FAILED) {
      throw new ForbiddenException('Only the driver of the ride can modify active trip statuses');
    }

    // 2. Validate state machine transition logic
    if (currentStatus === targetStatus) {
      return trip;
    }

    this.validateTransition(currentStatus, targetStatus);

    // 3. Process status transition inside transaction
    return this.prisma.$transaction(async (tx) => {
      const updateData: any = { status: targetStatus };

      if (targetStatus === TripStatus.STARTED) {
        updateData.startedAt = new Date();
        updateData.actualStartLocation = dto.actualStartLocation || trip.ride.pickupAddress;
        
        // Update ride status
        await tx.ride.update({
          where: { id: trip.rideId },
          data: { status: RideStatus.STARTED },
        });
      }

      if (targetStatus === TripStatus.COMPLETED) {
        updateData.completedAt = new Date();
        updateData.actualEndLocation = dto.actualEndLocation || trip.ride.destinationAddress;
        updateData.endedBy = userId;
        
        // Convert meters to KM
        const distanceKm = Number((trip.ride.routeDistanceMeters / 1000).toFixed(2));
        updateData.actualDistance = distanceKm;

        // Estimate average speed (km/h)
        const durationMin = Math.round(trip.ride.routeDurationSeconds / 60);
        updateData.averageSpeed = durationMin > 0 ? Number(((distanceKm / (durationMin / 60))).toFixed(1)) : 0;

        // Update ride status
        await tx.ride.update({
          where: { id: trip.rideId },
          data: { status: RideStatus.COMPLETED },
        });

        // Automatically chain state to PAYMENT_PENDING once trip is completed
        updateData.status = TripStatus.PAYMENT_PENDING;
      }

      if (targetStatus === TripStatus.CANCELLED) {
        // Cancel ride status
        await tx.ride.update({
          where: { id: trip.rideId },
          data: { status: RideStatus.CANCELLED },
        });
      }

      // Update trip record
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: updateData,
      });

      // Write audit log record
      await tx.auditLog.create({
        data: {
          userId,
          action: 'TRIP_STATUS_TRANSITION',
          entityName: 'Trip',
          entityId: id,
          oldValues: JSON.stringify({ status: currentStatus }),
          newValues: JSON.stringify({ status: updateData.status }),
        },
      });

      // Emit Domain Event for downstream decoupling modules (wallet billing, analytics)
      if (updateData.status === TripStatus.PAYMENT_PENDING) {
        this.eventEmitter.emit('trip.completed', {
          tripId: id,
          rideId: trip.rideId,
          driverId: trip.ride.driverId,
          fare: Number(trip.ride.farePerSeat),
          distanceKm: updateData.actualDistance,
          organizationId: trip.ride.organizationId,
        });
      }

      this.logger.log(`Trip ${id} transitioned from ${currentStatus} to ${updateData.status}`);
      return updatedTrip;
    });
  }

  /**
   * State machine validator enforcing strict one-directional states.
   */
  private validateTransition(current: TripStatus, target: TripStatus) {
    const allowedTransitions: Record<TripStatus, TripStatus[]> = {
      [TripStatus.BOOKED]: [TripStatus.STARTED, TripStatus.CANCELLED],
      [TripStatus.STARTED]: [TripStatus.IN_PROGRESS, TripStatus.COMPLETED, TripStatus.CANCELLED],
      [TripStatus.IN_PROGRESS]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
      [TripStatus.COMPLETED]: [TripStatus.PAYMENT_PENDING], // Handled internally
      [TripStatus.PAYMENT_PENDING]: [TripStatus.PAYMENT_COMPLETED, TripStatus.FAILED],
      [TripStatus.PAYMENT_COMPLETED]: [],
      [TripStatus.FAILED]: [TripStatus.PAYMENT_COMPLETED], // Retry payment allowed
      [TripStatus.CANCELLED]: [],
    };

    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(target)) {
      throw new BadRequestException(
        `Invalid trip state transition: cannot move status from ${current} to ${target}`,
      );
    }
  }
}
