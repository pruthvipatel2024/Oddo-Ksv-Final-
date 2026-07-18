/**
 * Vehicle verification status constants
 */
export const VEHICLE_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
} as const;

export type VehicleStatus = typeof VEHICLE_STATUS[keyof typeof VEHICLE_STATUS];
