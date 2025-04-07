import { Controller, Get, Param, Post, Query } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Post(':userId/follow/:targetId')
  async followUser(
    @Param('userId') userId: string,
    @Param('targetId') targetId: string,
  ) {
    return this.userService.follow(userId, targetId);
  }

  @Get(':userId/search')
  async searchUsers(
    @Param('userId') userId: string,
    @Query('q') query: string,
  ) {
    return this.userService.searchUsers(query, userId);
  }
}
