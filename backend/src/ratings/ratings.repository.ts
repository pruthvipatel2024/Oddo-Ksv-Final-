import { Injectable } from '@nestjs/common';
import { Rating } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RatingsRepository extends BaseRepository<Rating> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.rating);
  }

  /**
   * Calculate average rating score for a user.
   */
  async getAverageRating(userId: string): Promise<number> {
    const aggregate = await this.prisma.rating.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        revieweeId: userId,
      },
    });

    return aggregate._avg.rating
      ? Number(aggregate._avg.rating.toFixed(2))
      : 5.0;
  }

  /**
   * Find reviews received by a user.
   */
  async findByReviewee(userId: string): Promise<Rating[]> {
    return this.prisma.rating.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            organization: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
