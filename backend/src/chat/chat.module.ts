import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatRepository } from './chat.repository';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [JwtModule.register({}), TripsModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatRepository],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}
