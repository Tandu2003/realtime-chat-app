import { Model, Types } from 'mongoose';

import { BadRequestException, Injectable } from '@nestjs/common';
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

  // Lấy danh sách cuộc trò chuyện của người dùng
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

  async getConversationById(conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new BadRequestException('Cuộc trò chuyện không tồn tại');
    }
    return conversation;
  }

  // Tìm cuộc trò chuyện 1-1 giữa 2 người dùng nếu chưa có thì tạo mới
  async findOrCreateOneOnOneConversation(userId: string, userOtherId: string) {
    // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
    const existingConversation = await this.conversationModel
      .findOne({
        type: 'one-on-one',
        isGroup: false,
        participants: { $all: [userId, userOtherId], $size: 2 },
      })
      .populate('participants', '-password');

    // Nếu đã tồn tại thì trả về cuộc trò chuyện đó
    if (existingConversation) return existingConversation;

    // Nếu chưa tồn tại thì tạo mới
    const newConversation = new this.conversationModel({
      participants: [userId, userOtherId],
      isGroup: false,
      type: 'one-on-one',
      createdBy: userId,
    });

    const savedConversation = await newConversation.save();
    return savedConversation.populate('participants', '-password');
  }

  // Tạo nhóm trò chuyện
  async createGroupChat(
    userIds: string[],
    name: string,
    createdBy: string,
  ): Promise<Conversation> {
    // Kiểm tra xem người dùng đã tham gia cuộc trò chuyện chưa
    const existingConversation = await this.conversationModel.findOne({
      isGroup: true,
      participants: { $all: userIds, $size: userIds.length },
    });
    if (existingConversation) {
      throw new BadRequestException('Cuộc trò chuyện đã tồn tại');
    }

    if (userIds.length < 2) {
      throw new BadRequestException(
        'Số lượng người tham gia cuộc trò chuyện phải lớn hơn 2',
      );
    }

    const newGroup = new this.conversationModel({
      participants: [...new Set([...userIds, createdBy])],
      isGroup: true,
      name,
      createdBy,
    });

    return newGroup.save();
  }

  // Cập nhật tin nhắn cuối cùng trong cuộc trò chuyện
  async updateLastMessage(conversationId: string, messageId: string) {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      { lastMessage: messageId },
      { new: true },
    );
  }

  // Lấy thông tin cuộc trò chuyện theo id
  async getConversationWithLastMessage(conversationId: string) {
    return this.conversationModel.findById(conversationId).populate([
      { path: 'participants', select: '-password' },
      {
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username name profilePicture' },
      },
    ]);
  }

  async updateLastMessageObject(
    conversationId: string,
    message: {
      sender: string;
      text: string;
      createdAt: Date;
    },
  ) {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      { lastMessage: message },
      { new: true },
    );
  }
}
