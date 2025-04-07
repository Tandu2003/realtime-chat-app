import { Response } from 'express';

import { Body, Controller, Get, Post, Req, Request, Res } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body()
    data: {
      username: string;
      name: string;
      email: string;
      password: string;
    },
  ) {
    return this.authService.register(data);
  }

  @Post('login')
  login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(body, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    return this.authService.getMe(req);
  }
}
