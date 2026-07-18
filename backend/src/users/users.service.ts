import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new user.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const existingEmail = await this.usersRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingPhone = await this.usersRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw new ConflictException('Phone number is already registered');
    }

    return this.usersRepository.create(data);
  }

  /**
   * Find a user by ID.
   */
  async findById(id: string, organizationId?: string): Promise<User> {
    return this.usersRepository.findById(id, organizationId);
  }

  /**
   * Find a user by email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Update a user's details.
   */
  async update(id: string, data: Prisma.UserUpdateInput, organizationId?: string): Promise<User> {
    return this.usersRepository.update(id, data, organizationId);
  }

  /**
   * Save refresh token hash for user.
   */
  async updateRefreshToken(id: string, refreshTokenHash: string | null): Promise<void> {
    await this.usersRepository.update(id, { refreshTokenHash });
  }

  /**
   * Update the user's last login timestamp.
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }

  /**
   * Retrieve employee dashboard components.
   */
  async getEmployeeDashboard(userId: string) {
    const [upcomingBookings, offeredRides, vehicles] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          passengerId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          ride: {
            include: {
              driver: { select: { firstName: true, lastName: true, avatar: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.ride.findMany({
        where: {
          driverId: userId,
          status: { in: ['OPEN', 'FULL', 'STARTED'] },
        },
        include: {
          bookings: {
            include: {
              passenger: { select: { firstName: true, lastName: true, avatar: true } },
            },
          },
        },
        orderBy: { date: 'asc' },
        take: 5,
      }),
      this.prisma.vehicle.findMany({
        where: { ownerId: userId, deletedAt: null },
      }),
    ]);

    return {
      upcomingBookings,
      offeredRides,
      vehicles,
    };
  }

  /**
   * Retrieve organization admin commute statistics and metrics.
   */
  async getOrgAdminDashboard(orgId: string) {
    const [employeeCount, activeDrivers, activePassengers, pendingVehicles, rideHistory] = await Promise.all([
      this.prisma.user.count({ where: { organizationId: orgId, role: 'EMPLOYEE' } }),
      this.prisma.user.count({
        where: {
          organizationId: orgId,
          ridesAsDriver: { some: {} },
        },
      }),
      this.prisma.user.count({
        where: {
          organizationId: orgId,
          bookings: { some: {} },
        },
      }),
      this.prisma.vehicle.findMany({
        where: {
          owner: { organizationId: orgId },
          verificationStatus: 'PENDING',
        },
        include: {
          owner: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.ride.findMany({
        where: { organizationId: orgId },
        include: {
          driver: { select: { firstName: true, lastName: true } },
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalRides = await this.prisma.ride.count({ where: { organizationId: orgId, status: 'COMPLETED' } });
    const totalBookings = await this.prisma.booking.count({ where: { ride: { organizationId: orgId }, status: 'CONFIRMED' } });
    
    const completedTrips = await this.prisma.trip.findMany({
      where: { ride: { organizationId: orgId }, status: 'COMPLETED' },
      select: { actualDistance: true },
    });
    const totalDistance = completedTrips.reduce((sum, t) => sum + Number(t.actualDistance || 0), 0);
    const carbonSaved = Number((totalDistance * 0.12).toFixed(2));

    return {
      employeeCount,
      activeDrivers,
      activePassengers,
      pendingVehicles,
      rideHistory,
      stats: {
        totalRidesOffered: totalRides,
        totalBookingsConfirmed: totalBookings,
        totalDistanceKm: totalDistance,
        carbonSavedKg: carbonSaved,
      },
    };
  }

  /**
   * Retrieve platform owner statistics.
   */
  async getSuperAdminDashboard() {
    const [orgsCount, employeesCount, tripsCount, activeMarketplace, pendingWithdrawals] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      this.prisma.trip.count(),
      this.prisma.ride.count({ where: { status: { in: ['OPEN', 'FULL', 'STARTED'] } } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    ]);

    const settled = await this.prisma.driverSettlement.findMany({
      where: { status: 'SETTLED' },
      select: { grossFare: true, commissionAmount: true },
    });

    const totalRevenue = settled.reduce((sum, s) => sum + Number(s.grossFare), 0);
    const totalCommission = settled.reduce((sum, s) => sum + Number(s.commissionAmount), 0);

    return {
      orgsCount,
      employeesCount,
      tripsCount,
      activeMarketplace,
      pendingWithdrawals,
      totalRevenue,
      totalCommission,
    };
  }
}
