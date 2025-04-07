import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';

import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async getUserConversations(@Req() req: any) {
    return this.conversationService.getUserConversations(req.user._id);
  }

  @Get('one-on-one/find')
  findOneOnOne(@Query('userA') userA: string, @Query('userB') userB: string) {
    return this.conversationService.findOrCreateOneOnOne(userA, userB);
  }

  @Post('group')
  async createGroup(
    @Body() body: { userIds: string[]; name: string },
    @Req() req: any,
  ) {
    return this.conversationService.createGroupChat(
      body.userIds,
      body.name,
      req.user._id, // từ AuthMiddleware
    );
  }
}
