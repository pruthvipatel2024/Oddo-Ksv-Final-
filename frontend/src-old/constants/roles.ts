/**
 * User roles in the application
 */
export const USER_ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
