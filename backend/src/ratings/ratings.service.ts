import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Rating } from '@prisma/client';
import { RatingsRepository } from './ratings.repository';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger('RatingsService');

  constructor(
    private readonly ratingsRepository: RatingsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Submit a new rating.
   */
  async create(reviewerId: string, dto: CreateRatingDto): Promise<Rating> {
    // 1. Verify trip is completed
    const trip = await this.prisma.trip.findUnique({
      where: { id: dto.tripId },
      include: {
        ride: true,
        participants: true,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    if (trip.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Ratings can only be submitted for completed trips',
      );
    }

    // 2. Verify reviewer and reviewee are part of the trip
    const isReviewerInTrip =
      trip.ride.driverId === reviewerId ||
      trip.participants.some((p) => p.userId === reviewerId);
    const isRevieweeInTrip =
      trip.ride.driverId === dto.revieweeId ||
      trip.participants.some((p) => p.userId === dto.revieweeId);

    if (!isReviewerInTrip || !isRevieweeInTrip) {
      throw new BadRequestException(
        'Both reviewer and reviewee must be participants in the trip',
      );
    }

    if (reviewerId === dto.revieweeId) {
      throw new BadRequestException('Users cannot rate themselves');
    }

    // 3. Verify duplicate rating prevention
    const existing = await this.prisma.rating.findFirst({
      where: {
        tripId: dto.tripId,
        reviewerId,
        revieweeId: dto.revieweeId,
        type: dto.type,
      },
    });

    if (existing) {
      throw new ConflictException(
        'You have already submitted a rating for this user on this trip',
      );
    }

    // 4. Record rating
    const rating = await this.ratingsRepository.create({
      tripId: dto.tripId,
      reviewerId,
      revieweeId: dto.revieweeId,
      rating: dto.rating,
      reviewText: dto.reviewText || null,
      type: dto.type,
    });

    this.logger.log(
      `Rating logged: Trip #${dto.tripId} reviewer: ${reviewerId} reviewee: ${dto.revieweeId} rating: ${dto.rating}`,
    );
    return rating;
  }

  /**
   * Get dynamic average rating.
   */
  async getAverageRating(userId: string): Promise<number> {
    return this.ratingsRepository.getAverageRating(userId);
  }

  /**
   * Get reviews lists for user.
   */
  async findByReviewee(userId: string): Promise<Rating[]> {
    return this.ratingsRepository.findByReviewee(userId);
  }
}
