import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('Không có token.');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req['user'] = decoded;
      next();
    } catch (err) {
      throw new UnauthorizedException('Token không hợp lệ.');
    }
  }
}
