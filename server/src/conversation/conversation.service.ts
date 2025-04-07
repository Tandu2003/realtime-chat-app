import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async getUserConversations(userId: string) {
    return this.conversationModel
      .find({
        participants: userId,
      })
      .populate('participants', '-password');
  }

  async findOrCreateOneOnOne(userA: string, userB: string) {
    const existing = await this.conversationModel.findOne({
      isGroup: false,
      participants: { $all: [userA, userB], $size: 2 },
    });

    if (existing) return existing;

    const newConvo = new this.conversationModel({
      participants: [userA, userB],
    });

    return newConvo.save();
  }
}
