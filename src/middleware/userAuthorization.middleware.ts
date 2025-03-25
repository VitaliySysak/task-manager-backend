import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserAuthorizationMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request & { user: User }, next: NextFunction) {
    const { authorization } = req.headers as { authorization?: string };

    if (!authorization) {
      throw new UnauthorizedException(
        `User do not provide authorization token`,
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { token: authorization.replace('Bearer ', '').trim() },
    });

    if (!user) {
      throw new BadRequestException(
        `User with such authorization token was not found`,
      );
    }

    req.user = user;

    next();
  }
}
