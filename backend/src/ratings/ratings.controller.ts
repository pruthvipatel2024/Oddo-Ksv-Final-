import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Ratings & Reviews')
@Controller({
  path: 'ratings',
  version: '1',
})
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit a driver or passenger review', description: 'Can only be submitted for completed trips. Duplicate ratings are rejected.' })
  @ApiResponse({ status: 201, description: 'Rating recorded.' })
  @ApiResponse({ status: 400, description: 'Invalid trip or participants.' })
  @ApiResponse({ status: 409, description: 'Conflict. Rating already exists.' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateRatingDto) {
    return {
      success: true,
      data: await this.ratingsService.create(user.sub, dto),
    };
  }

  @Get('user/:userId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user reviews and average rating score', description: 'Retrieves calculated average rating and review entries.' })
  @ApiResponse({ status: 200, description: 'Return reviews and score.' })
  async findUserRatings(@Param('userId') userId: string) {
    const [averageRating, reviews] = await Promise.all([
      this.ratingsService.getAverageRating(userId),
      this.ratingsService.findByReviewee(userId),
    ]);

    return {
      success: true,
      data: {
        averageRating,
        reviews,
      },
    };
  }

  @Get('my-reviews')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List reviews received by the current user', description: 'Returns all reviews logged for the user.' })
  @ApiResponse({ status: 200, description: 'Return reviews list.' })
  async getMyReviews(@CurrentUser() user: JwtPayload) {
    const [averageRating, reviews] = await Promise.all([
      this.ratingsService.getAverageRating(user.sub),
      this.ratingsService.findByReviewee(user.sub),
    ]);

    return {
      success: true,
      data: {
        averageRating,
        reviews,
      },
    };
  }
}
