import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { OrganizationsRepository } from './organizations.repository';

@Injectable()
export class OrganizationsService {
  constructor(private readonly orgsRepository: OrganizationsRepository) {}

  /**
   * Create a new organization.
   */
  async create(data: {
    name: string;
    code: string;
    emailDomain?: string;
    address: string;
    city: string;
    state: string;
    country: string;
  }): Promise<Organization> {
    const existing = await this.orgsRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictException('Organization with this code already exists');
    }
    return this.orgsRepository.create(data as any);
  }

  /**
   * Find organization by ID.
   */
  async findById(id: string): Promise<Organization> {
    return this.orgsRepository.findById(id);
  }

  /**
   * Find organization by code.
   */
  async findByCode(code: string): Promise<Organization | null> {
    return this.orgsRepository.findByCode(code);
  }

  /**
   * List all registered organizations.
   */
  async findAll(): Promise<Organization[]> {
    return this.orgsRepository.findAll();
  }

  /**
   * Update settings (such as cost per km or fuel costs).
   */
  async update(
    id: string,
    data: Prisma.OrganizationUpdateInput,
  ): Promise<Organization> {
    return this.orgsRepository.update(id, data);
  }
}
