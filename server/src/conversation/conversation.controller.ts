import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async getUserConversations(@Req() req: any) {
    return this.conversationService.getUserConversations(req.user._id);
  }

  // Tìm cuộc trò chuyện 1-1 giữa 2 người dùng
  @Post('one-on-one')
  async findOneOnOne(
    @Body('userOtherId') userOtherId: string,
    @Req() req: any,
  ) {
    const userId = req['user'].userId;
    if (!userOtherId) {
      throw new BadRequestException('Thiếu thông tin người dùng');
    }

    return this.conversationService.findOrCreateOneOnOneConversation(
      userId,
      userOtherId,
    );
  }

  // Tạo nhóm trò chuyện
  @Post('group')
  async createGroup(
    @Body() body: { userIds: string[]; name: string },
    @Req() req: any,
  ) {
    return this.conversationService.createGroupChat(
      body.userIds,
      body.name,
      req.user._id,
    );
  }
}
