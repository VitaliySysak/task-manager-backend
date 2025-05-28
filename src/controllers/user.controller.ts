import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { RegisterDto } from 'src/models/user/register.dto';
import {
  NotAllowed,
  UserAlreadyExists,
  WrongPasswordOrEmail,
} from 'src/common';
import { User } from '@prisma/client';
import { LoginDto } from 'src/models/user/login.dto';
import { Request, Response } from 'express';

const { BACKEND_ROUTE, DOMAIN_NAME } = process.env;
const isProd = process.env.NODE_ENV === 'production';

@Controller({ path: '/users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Admin
  @Get('/all')
  async getAll(@Req() req: Request & { user: User }) {
    try {
      const { user } = req;

      const allUsers = await this.userService.getAll(user);

      return allUsers;
    } catch (error) {
      if (error instanceof NotAllowed) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution user.controller/getAll:', error);
      throw new InternalServerErrorException();
    }
  }

  @Post('/admin/register')
  async adminRegister(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const data = await this.userService.adminRegister(body, req);

      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: BACKEND_ROUTE + '/users/refresh',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        domain: DOMAIN_NAME,
      });

      const { refreshToken, ...rest } = data;

      return rest;
    } catch (error) {
      if (error instanceof NotAllowed || error instanceof UserAlreadyExists) {
        throw new BadRequestException(error.message);
      }
      console.error(
        'Error while execution user.controller/adminRegister:',
        error,
      );
      throw new InternalServerErrorException();
    }
  }

  // User
  @Post('/register')
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const data = await this.userService.register(body, req);

      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: BACKEND_ROUTE + '/users/refresh',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        domain: DOMAIN_NAME,
      });

      const { refreshToken, ...rest } = data;

      return rest;
    } catch (error) {
      if (error instanceof UserAlreadyExists) {
        throw new BadRequestException(error.message);
      } else {
        console.error('Error while execution user.controller/register:', error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Post('/login')
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const data = await this.userService.login(body, req);

      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: BACKEND_ROUTE + '/users/refresh',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        domain: DOMAIN_NAME,
      });

      const { refreshToken, ...rest } = data;

      return rest;
    } catch (error) {
      if (error instanceof WrongPasswordOrEmail) {
        throw new BadRequestException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        console.error('Error while execution user.controller/login:', error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['refreshToken'];
    if (!token) throw new BadRequestException('No refreshToken in cookies');

    const data = await this.userService.refresh(token);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: DOMAIN_NAME + '/users/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: BACKEND_ROUTE,
    });

    const { refreshToken, ...rest } = data;

    return rest;
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: DOMAIN_NAME + '/users/refresh',
      domain: BACKEND_ROUTE,
    });
    return { message: 'Logged out successfully' };
  }
}
