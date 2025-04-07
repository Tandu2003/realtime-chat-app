import { Model, Types } from 'mongoose';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(data: Partial<User>): Promise<User> {
    const newUser = new this.userModel(data);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async follow(userId: string, targetId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    const target = await this.userModel.findById(targetId);

    if (!user || !target) throw new NotFoundException('User not found');

    const hasFollowed = user.following.includes(new Types.ObjectId(targetId));

    if (hasFollowed) {
      // Hủy theo dõi
      user.following = user.following.filter(
        (id) => id.toString() !== targetId,
      );
      target.followers = target.followers.filter(
        (id) => id.toString() !== userId,
      );
      await user.save();
      await target.save();
      return 'Unfollowed';
    } else {
      // Theo dõi
      user.following.push(new Types.ObjectId(targetId));
      target.followers.push(new Types.ObjectId(userId));
      await user.save();
      await target.save();
      return 'Followed';
    }
  }

  async searchUsers(query: string, currentUserId: string) {
    const isObjectId = Types.ObjectId.isValid(currentUserId);
    if (!isObjectId) throw new NotFoundException('ID không hợp lệ');

    const currentUser = await this.userModel.findById(currentUserId);
    if (!currentUser) throw new NotFoundException('Current user not found');

    const followingIds = currentUser.following.map((id) => id.toString());

    const users = await this.userModel.find({
      $or: [
        // Nếu đã follow → được tìm theo name hoặc username (gần đúng)
        {
          _id: { $in: followingIds },
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
          ],
        },
        // Nếu chưa follow → chỉ tìm username chính xác (case-insensitive)
        {
          _id: { $nin: followingIds },
          username: new RegExp(`^${query}$`, 'i'), // phải đúng toàn bộ username
        },
      ],
      _id: { $ne: currentUserId }, // không trả chính mình
    });

    return users;
  }

  async setUserOnline(userId: string, socketId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId,
      lastSeen: new Date(),
    });
  }

  async setUserOffline(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      isOnline: false,
      socketId: '',
      lastSeen: new Date(),
    });
  }
}
