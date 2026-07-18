import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
}
