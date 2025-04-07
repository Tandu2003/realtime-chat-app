import { Controller, Get, Param, Query } from '@nestjs/common';

import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get(':userId')
  getUserConversations(@Param('userId') userId: string) {
    return this.conversationService.getUserConversations(userId);
  }

  @Get('one-on-one/find')
  findOneOnOne(@Query('userA') userA: string, @Query('userB') userB: string) {
    return this.conversationService.findOrCreateOneOnOne(userA, userB);
  }
}
