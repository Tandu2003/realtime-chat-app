import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // POST /messages/send
  @Post('send')
  async sendMessage(
    @Body() body: { conversationId: string; senderId: string; text: string },
  ) {
    const { conversationId, senderId, text } = body;
    return this.messageService.sendMessage(conversationId, senderId, text);
  }

  // GET /messages/:conversationId
  @Get(':conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.messageService.getMessages(conversationId);
  }

  // PATCH /messages/seen/:id
  @Patch('seen/:id')
  async markAsSeen(@Param('id') messageId: string) {
    return this.messageService.markAsSeen(messageId);
  }
}
