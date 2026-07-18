import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Vehicle, VehicleVerificationStatus, UserRole } from '@prisma/client';
import { VehiclesRepository } from './vehicles.repository';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly vehiclesRepository: VehiclesRepository,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Register a new vehicle for a driver.
   */
  async create(ownerId: string, dto: CreateVehicleDto): Promise<Vehicle> {
    const existing = await this.vehiclesRepository.findByRegistrationNumber(
      dto.registrationNumber,
    );
    if (existing) {
      throw new ConflictException(
        'A vehicle with this registration number is already registered',
      );
    }

    return this.vehiclesRepository.create({
      manufacturer: dto.manufacturer,
      model: dto.model,
      color: dto.color,
      registrationNumber: dto.registrationNumber,
      seatingCapacity: dto.seatingCapacity,
      insuranceExpiry: dto.insuranceExpiry
        ? new Date(dto.insuranceExpiry)
        : null,
      pollutionExpiry: dto.pollutionExpiry
        ? new Date(dto.pollutionExpiry)
        : null,
      vehiclePhoto: dto.vehiclePhoto || null,
      ownerId,
    });
  }

  /**
   * Find all vehicles belonging to a specific driver.
   */
  async findByOwnerId(ownerId: string): Promise<Vehicle[]> {
    return this.vehiclesRepository.findByOwnerId(ownerId);
  }

  /**
   * Find a specific vehicle, verifying owner and organization context.
   */
  async findById(
    id: string,
    requesterId: string,
    requesterRole: string,
    requesterOrgId?: string,
  ): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(id);

    // Fetch the vehicle owner to check their organization ID
    const owner = await this.usersService.findById(vehicle.ownerId);

    // Enforce multi-tenancy and ownership isolation
    if (requesterRole !== UserRole.SUPER_ADMIN) {
      // 1. Must belong to the same organization
      if (owner.organizationId !== requesterOrgId) {
        throw new ForbiddenException(
          'You cannot access vehicles from another organization',
        );
      }

      // 2. Standard employees can only access details of their own vehicles
      if (vehicle.ownerId !== requesterId) {
        throw new ForbiddenException('You do not own this vehicle');
      }
    }

    return vehicle;
  }

  /**
   * Find a vehicle without strict user ownership checks (useful inside Ride module validation).
   * It still enforces organization isolation.
   */
  async findByIdScoped(id: string, organizationId?: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(id);
    const owner = await this.usersService.findById(vehicle.ownerId);

    if (organizationId && owner.organizationId !== organizationId) {
      throw new ForbiddenException(
        'This vehicle belongs to a user from another organization',
      );
    }

    return vehicle;
  }

  /**
   * Update own vehicle details.
   */
  async update(
    id: string,
    ownerId: string,
    dto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (vehicle.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this vehicle');
    }

    const updateData: any = { ...dto };
    if (dto.insuranceExpiry)
      updateData.insuranceExpiry = new Date(dto.insuranceExpiry);
    if (dto.pollutionExpiry)
      updateData.pollutionExpiry = new Date(dto.pollutionExpiry);

    return this.vehiclesRepository.update(id, updateData);
  }

  /**
   * Soft delete own vehicle.
   */
  async delete(id: string, ownerId: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (vehicle.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this vehicle');
    }

    return this.vehiclesRepository.softDelete(id);
  }

  async verify(
    id: string,
    status: VehicleVerificationStatus,
    adminOrgId?: string,
  ): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(id);

    if (adminOrgId) {
      const owner = await this.usersService.findById(vehicle.ownerId);
      if (owner.organizationId !== adminOrgId) {
        throw new ForbiddenException(
          'Cannot verify vehicle belonging to an employee in another organization',
        );
      }
    }

    return this.vehiclesRepository.update(id, { verificationStatus: status });
  }

  /**
   * Get all registered vehicles in the platform (Super Admin or Org Admin views).
   */
  async findAll(organizationId?: string): Promise<any[]> {
    return this.vehiclesRepository.findAllWithOwners(organizationId);
  }
}
