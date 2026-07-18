import { apiClient } from './client';

export interface CreateRatingPayload {
  tripId: string;
  revieweeId: string;
  rating: number; // 1-5
  reviewText?: string;
  type: 'DRIVER_TO_PASSENGER' | 'PASSENGER_TO_DRIVER';
}

export interface ReviewResponse {
  averageRating: number;
  reviews: any[];
}

export const ratingsApi = {
  create: (payload: CreateRatingPayload) => 
    apiClient.post<{ success: boolean; data: any }>('/ratings', payload),

  findUserRatings: (userId: string) => 
    apiClient.get<{ success: boolean; data: ReviewResponse }>(`/ratings/user/${userId}`),

  getMyReviews: () => 
    apiClient.get<{ success: boolean; data: ReviewResponse }>('/ratings/my-reviews'),
};
