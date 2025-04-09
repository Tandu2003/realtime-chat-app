import { Request } from "express";

import { Controller, Get, Param, Post, Query, Req } from "@nestjs/common";

import { UserService } from "./user.service";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Post('follow/:targetId')
  async followUser(@Param('targetId') targetId: string, @Req() req: Request) {
    const userId = req['user'].userId;
    return this.userService.follow(userId, targetId);
  }

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
}
