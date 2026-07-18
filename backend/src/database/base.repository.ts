import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelDelegate: any,
  ) {}

  /**
   * Helper to append organizationId to database filters.
   * If organizationId is provided, it isolates the query.
   */
  protected applyTenantFilter(whereClause: any, organizationId?: string): any {
    if (organizationId) {
      return {
        ...whereClause,
        organizationId,
      };
    }
    return whereClause;
  }

  /**
   * Find record by ID, checking organization isolation.
   */
  async findById(id: string, organizationId?: string): Promise<T> {
    const where = this.applyTenantFilter({ id }, organizationId);
    const item = await this.modelDelegate.findFirst({ where });
    if (!item) {
      throw new NotFoundException('Record not found or you do not have access');
    }
    return item;
  }

  /**
   * Find first record matching standard criteria.
   */
  async findFirst(whereClause: any, organizationId?: string): Promise<T | null> {
    const where = this.applyTenantFilter(whereClause, organizationId);
    return this.modelDelegate.findFirst({ where });
  }

  /**
   * Find all records matching criteria.
   */
  async findAll(whereClause: any = {}, organizationId?: string): Promise<T[]> {
    const where = this.applyTenantFilter(whereClause, organizationId);
    return this.modelDelegate.findMany({ where });
  }

  /**
   * Create a new record.
   */
  async create(data: any): Promise<T> {
    return this.modelDelegate.create({ data });
  }

  /**
   * Update an existing record.
   */
  async update(id: string, data: any, organizationId?: string): Promise<T> {
    // Verify record exists and belongs to the organization
    await this.findById(id, organizationId);
    return this.modelDelegate.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete a record if it has a deletedAt column.
   */
  async softDelete(id: string, organizationId?: string): Promise<T> {
    await this.findById(id, organizationId);
    return this.modelDelegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Hard delete a record.
   */
  async hardDelete(id: string, organizationId?: string): Promise<T> {
    await this.findById(id, organizationId);
    return this.modelDelegate.delete({
      where: { id },
    });
  }

  /**
   * Count total items matching filter.
   */
  async count(whereClause: any = {}, organizationId?: string): Promise<number> {
    const where = this.applyTenantFilter(whereClause, organizationId);
    return this.modelDelegate.count({ where });
  }
}
