import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TrackingGateway } from './tracking.gateway';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [
    JwtModule.register({}),
    TripsModule,
  ],
  providers: [TrackingGateway],
  exports: [TrackingGateway],
})
export class TrackingModule {}
