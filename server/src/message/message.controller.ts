import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';

import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':conversationId/send')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body('text') text: string,
    @Req() req: any,
  ) {
    const senderId = req.user.userId;
    return this.messageService.sendMessage(conversationId, senderId, text);
  }

  @Get(':conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.messageService.getMessages(conversationId);
  }

  @Patch(':messageId/seen')
  async markAsSeen(@Param('messageId') messageId: string) {
    return this.messageService.markAsSeen(messageId);
  }
}
