import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Trip, TripStatus, RideStatus, PaymentStatus } from '@prisma/client';
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
   * Get detailed trip details.
   */
  async findById(id: string): Promise<any> {
    const trip = await this.tripsRepository.findDetailById(id);
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
    dto: UpdateTripStatusDto,
  ): Promise<Trip> {
    const trip = await this.tripsRepository.findDetailById(id);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const currentStatus = trip.status;
    const targetStatus = dto.status;

    // 1. Enforce driver authorization for operations (only driver can start/complete/cancel)
    const isDriver = trip.ride.driverId === userId;
    if (!isDriver) {
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

        // --- PERFORM DRIVER WALLET EARNINGS SETTLEMENT ---
        const confirmedBookings = await tx.booking.findMany({
          where: { rideId: trip.rideId, status: 'CONFIRMED' },
        });

        const grossFare = confirmedBookings.reduce((sum, b) => sum + Number(b.fare), 0);
        const commissionRate = Number(process.env.PLATFORM_COMMISSION_PERCENT || 10) / 100;
        const commissionAmount = Number((grossFare * commissionRate).toFixed(2));
        const netEarnings = grossFare - commissionAmount;

        // Update payment records status to SUCCESS
        await tx.payment.updateMany({
          where: { tripId: id, status: PaymentStatus.ESCROWED },
          data: { status: PaymentStatus.SUCCESS },
        });

        // Credit Driver Wallet availableBalance
        const driverWallet = await tx.wallet.findUnique({
          where: { userId: trip.ride.driverId },
        });

        if (driverWallet) {
          await tx.wallet.update({
            where: { id: driverWallet.id },
            data: {
              availableBalance: Number(driverWallet.availableBalance) + netEarnings,
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: driverWallet.id,
              userId: trip.ride.driverId,
              amount: netEarnings,
              type: 'CREDIT',
              description: `Earnings for completed Trip #${id} (Net: ${netEarnings}, Comm: ${commissionAmount})`,
            },
          });
        }

        // Log Driver Settlement
        await tx.driverSettlement.create({
          data: {
            driverId: trip.ride.driverId,
            tripId: id,
            grossFare,
            commissionAmount,
            netEarnings,
            status: 'SETTLED',
          },
        });
      }

      if (targetStatus === TripStatus.CANCELLED) {
        // Cancel ride status
        await tx.ride.update({
          where: { id: trip.rideId },
          data: { status: RideStatus.CANCELLED },
        });

        // --- REFUND PASSENGER WALLETS ---
        const confirmedBookings = await tx.booking.findMany({
          where: { rideId: trip.rideId, status: 'CONFIRMED' },
        });

        for (const booking of confirmedBookings) {
          const payment = await tx.payment.findFirst({
            where: { bookingId: booking.id, status: PaymentStatus.ESCROWED },
          });

          if (payment) {
            const wallet = await tx.wallet.findUnique({
              where: { userId: booking.passengerId },
            });

            if (wallet) {
              await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                  availableBalance: Number(wallet.availableBalance) + Number(payment.amount),
                },
              });

              await tx.walletTransaction.create({
                data: {
                  walletId: wallet.id,
                  userId: booking.passengerId,
                  amount: payment.amount,
                  type: 'REFUND',
                  description: `Refund for cancelled trip #${id}`,
                },
              });
            }

            await tx.payment.update({
              where: { id: payment.id },
              data: { status: PaymentStatus.REFUNDED },
            });
          }

          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: 'CANCELLED',
              cancelReason: 'Trip cancelled by driver',
            },
          });
        }
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

      // Emit Domain Event for decouple syncs
      this.eventEmitter.emit('trip.status_changed', {
        tripId: id,
        status: updateData.status,
      });

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
      [TripStatus.COMPLETED]: [],
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
