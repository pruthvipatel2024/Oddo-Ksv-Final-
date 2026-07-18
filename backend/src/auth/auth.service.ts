import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { OrganizationsRepository } from '../organizations/organizations.repository';
import { RedisService } from '../database/redis.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly orgsRepository: OrganizationsRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Register a new employee.
   */
  async register(dto: RegisterDto): Promise<{ success: boolean; data: any }> {
    // 1. Verify organization exists
    const org = await this.orgsRepository.findByCode(dto.organizationCode);
    if (!org) {
      throw new BadRequestException('Invalid organization code');
    }

    // 3. Hash the user's password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // 4. Create user and their wallet inside a transaction for atomicity
    const newUser = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          employeeCode: dto.employeeCode || null,
          role: UserRole.EMPLOYEE,
          userType: dto.userType,
          status: UserStatus.ACTIVE,
          organizationId: org.id,
        },
      });

      // Create empty wallet for the user
      await tx.wallet.create({
        data: {
          userId: user.id,
          availableBalance: 0.0,
          pendingEarnings: 0.0,
        },
      });

      return user;
    });

    this.logger.log(`User registered successfully: ${newUser.email} under Organization: ${org.name}`);

    // Expose clean data without password hash
    const { passwordHash: _, refreshTokenHash: __, ...cleanUser } = newUser;
    return {
      success: true,
      data: cleanUser,
    };
  }

  /**
   * Log in user and generate JWT tokens.
   */
  async login(dto: LoginDto): Promise<{ success: boolean; data: { accessToken: string; refreshToken: string; user: any } }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token set
    const tokens = await this.generateTokens(user);
    
    // Save refresh token hash in DB
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    this.logger.log(`User logged in: ${user.email}`);

    const { passwordHash: _, refreshTokenHash: __, ...cleanUser } = user;
    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: cleanUser,
      },
    };
  }

  /**
   * Rotate access & refresh tokens using a valid refresh token.
   */
  async refresh(refreshToken: string): Promise<{ success: boolean; data: { accessToken: string; refreshToken: string } }> {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      const payload: JwtPayload = this.jwtService.verify(refreshToken, { secret: refreshSecret });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshTokenHash || user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('Invalid or revoked session');
      }

      // Validate refresh token hash
      const isMatched = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isMatched) {
        throw new UnauthorizedException('Invalid or revoked session');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Save new refresh token hash
      const newRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersService.updateRefreshToken(user.id, newRefreshTokenHash);

      return {
        success: true,
        data: tokens,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Log out user, clear refresh token hash, and blacklist current access token in Redis.
   */
  async logout(userId: string, accessToken: string): Promise<{ success: boolean; message: string }> {
    // 1. Clear refresh token hash
    await this.usersService.updateRefreshToken(userId, null);

    // 2. Extract expiration of access token to blacklist it for the remaining time
    try {
      const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
      const decoded = this.jwtService.verify(accessToken, { secret: accessSecret });
      const now = Math.floor(Date.now() / 1000);
      const remainingSeconds = decoded.exp - now;

      if (remainingSeconds > 0) {
        // Add to Redis blacklist
        await this.redisService.set(`blacklist:${accessToken}`, 'true', remainingSeconds);
      }
    } catch (err) {
      // Token is already expired or invalid, blacklist isn't strictly required
    }

    this.logger.log(`User logged out: ${userId}`);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Helper to build access and refresh tokens.
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      userType: user.userType,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
