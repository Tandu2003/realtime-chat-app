import { Model, Types } from 'mongoose';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async sendMessage(conversationId: string, senderId: string, text: string) {
    const message = await this.messageModel.create({
      conversation: new Types.ObjectId(conversationId),
      sender: new Types.ObjectId(senderId),
      text,
    });

    return message.populate('sender', 'username name profilePicture');
  }

  async getMessages(conversationId: string) {
    return this.messageModel
      .find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username name profilePicture');
  }

  async markAsSeen(messageId: string) {
    const message = await this.messageModel.findById(messageId);
    if (!message) throw new NotFoundException('Tin nhắn không tồn tại');

    message.seen = true;
    await message.save();
    return message;
  }
}
