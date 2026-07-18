/**
 * Ride and Trip status constants
 */
export const RIDE_STATUS = {
  OPEN: 'OPEN',
  FULL: 'FULL',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type RideStatus = typeof RIDE_STATUS[keyof typeof RIDE_STATUS];

export const TRIP_STATUS = {
  BOOKED: 'BOOKED',
  STARTED: 'STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
} as const;

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS];
