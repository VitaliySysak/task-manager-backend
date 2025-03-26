import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserAuthorizationMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request & { user?: User }, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const cookieToken = req.cookies?.token;

    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    } else if (cookieToken) {
      token = cookieToken.trim();
    }

    if (!token) {
      throw new UnauthorizedException(
        'No authorization token provided (neither in header nor cookies)',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { token },
    });

    if (!user) {
      throw new BadRequestException(
        'User with the provided token was not found',
      );
    }

    req.user = user;
    next();
  }
}
