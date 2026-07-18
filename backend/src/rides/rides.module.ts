import { Module } from '@nestjs/common';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { RidesRepository } from './rides.repository';
import { MapsModule } from '../maps/maps.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [MapsModule, VehiclesModule, OrganizationsModule],
  controllers: [RidesController],
  providers: [RidesService, RidesRepository],
  exports: [RidesService, RidesRepository],
})
export class RidesModule {}
