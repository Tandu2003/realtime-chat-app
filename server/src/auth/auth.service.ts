import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async register(data: {
    username: string;
    name: string;
    email: string;
    password: string;
  }) {
    const { username, name, email, password } = data;

    // Kiểm tra email hoặc username đã tồn tại chưa
    const existingEmail = await this.userModel.findOne({ email });
    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại.');
    }

    const existingUserName = await this.userModel.findOne({ username });
    if (existingUserName) {
      throw new ConflictException('Username đã tồn tại.');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new this.userModel({
      username,
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // 🚨 Sau này gửi email xác thực ở đây

    return {
      message: 'Đăng ký thành công. Vui lòng xác thực email',
      user: {
        _id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
      },
    };
  }

  async login(data: { email: string; password: string }, res: Response) {
    const { email, password } = data;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    );

    // Set token vào cookie ở đây
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return {
      message: 'Đăng nhập thành công!',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    };
  }

  logout(res: Response) {
    res.clearCookie('token');
    return { message: 'Đăng xuất thành công!' };
  }

  getMe(req: Request) {
    return {
      user: req['user'],
    };
  }
}
