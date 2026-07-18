import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Chat')
@Controller({
  path: 'chat',
  version: '1',
})
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('trips/:tripId/messages')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get trip chat message history',
    description:
      'Returns all messages scoped to the trip ID. Access is strictly limited to trip participants.',
  })
  @ApiResponse({ status: 200, description: 'Return array of messages.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden if the user is not a participant of this trip.',
  })
  @ApiResponse({
    status: 404,
    description: 'Trip or chat conversation not found.',
  })
  async getMessages(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return {
      success: true,
      data: await this.chatService.getMessages(tripId, user.sub),
    };
  }
}
