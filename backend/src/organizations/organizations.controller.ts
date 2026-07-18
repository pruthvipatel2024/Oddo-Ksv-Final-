import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('Organizations')
@Controller({
  path: 'organizations',
  version: '1',
})
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List all organizations',
    description:
      'Lists all registered organizations. Publicly accessible for signup lookup.',
  })
  @ApiResponse({ status: 200, description: 'Return array of organizations.' })
  async findAll() {
    return {
      success: true,
      data: await this.orgsService.findAll(),
    };
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new organization',
    description: 'Restricted to Platform Super Admins.',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requester is not Super Admin.',
  })
  async create(@Body() dto: CreateOrganizationDto) {
    return {
      success: true,
      data: await this.orgsService.create(dto),
    };
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get organization details by ID',
    description: 'Users can only retrieve details of their own organization.',
  })
  @ApiResponse({ status: 200, description: 'Return organization details.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden if accessing another org profile.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // Enforce organization isolation
    if (user.role !== UserRole.SUPER_ADMIN && user.organizationId !== id) {
      throw new ForbiddenException(
        'You cannot access another organization’s data',
      );
    }

    return {
      success: true,
      data: await this.orgsService.findById(id),
    };
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update organization settings',
    description: 'Restricted to Super Admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return {
      success: true,
      data: await this.orgsService.update(id, dto),
    };
  }
}
