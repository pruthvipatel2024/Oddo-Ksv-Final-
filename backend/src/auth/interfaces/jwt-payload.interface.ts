import { UserRole, UserType } from '@prisma/client';

export class JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  userType: UserType;
  organizationId: string | null;
}
