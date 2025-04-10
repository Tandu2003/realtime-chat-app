import { Request } from 'express';

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  // @Post('follow/:targetId')
  // async followUser(@Param('targetId') targetId: string, @Req() req: Request) {
  //   const userId = req['user'].userId;
  //   return this.userService.follow(userId, targetId);
  // }

  @Get('search')
  async searchUsers(@Query('q') query: string, @Req() req: Request) {
    const userId = req['user'].userId;
    return this.userService.searchUsers(query, userId);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = req['user'].userId;
    return this.userService.findById(userId);
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    return this.userService.findById(userId);
  }

  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user._id, updateProfileDto);
  }

  @Post('follow/:id')
  async followUser(@Req() req, @Param('id') targetId: string) {
    return this.userService.toggleFollow(req.user._id, targetId);
  }
}
