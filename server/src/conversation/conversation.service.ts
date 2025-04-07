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
      .populate([
        { path: 'participants', select: '-password' },
        { path: 'lastMessage' },
      ])
      .sort({ updatedAt: -1 });
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

    const savedConvo = await newConvo.save();

    return savedConvo.populate('participants', '-password');
  }

  async createGroupChat(
    userIds: string[],
    name: string,
    createdBy: string,
  ): Promise<Conversation> {
    if (userIds.length < 2) {
      throw new Error('A group must have at least 3 members including you');
    }

    const newGroup = new this.conversationModel({
      participants: [...new Set([...userIds, createdBy])],
      isGroup: true,
      name,
      createdBy,
    });

    return newGroup.save();
  }
}
