import { Model, Types } from 'mongoose';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password');
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

  // Đặt socketId và isOnline=true
  async setUserOnline(userId: string, socketId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId,
    });
  }

  // Tìm theo socketId, đặt isOnline=false
  async setUserOffline(socketId: string) {
    return this.userModel.findOneAndUpdate(
      { socketId },
      {
        isOnline: false,
        socketId: null,
      },
    );
  }

  // Trả về tất cả user đang online
  async getOnlineUsers() {
    return this.userModel.find({ isOnline: true });
  }

  async findByUsername(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      updateProfileDto,
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async toggleFollow(currentUserId: string, targetUserId: string) {
    // Don't allow users to follow themselves
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const currentUser = await this.userModel.findById(currentUserId);
    const targetUser = await this.userModel.findById(targetUserId);

    if (!currentUser || !targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(
      new Types.ObjectId(targetUserId),
    );

    if (isFollowing) {
      // Unfollow logic
      await this.userModel.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId },
      });
      await this.userModel.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId },
      });
    } else {
      // Follow logic
      await this.userModel.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId },
      });
      await this.userModel.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId },
      });
    }

    // Return updated current user and follow status
    const updatedCurrentUser = await this.userModel.findById(currentUserId);

    return {
      isFollowing: !isFollowing,
      currentUser: updatedCurrentUser,
    };
  }
}
