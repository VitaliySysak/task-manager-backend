import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { NotAllowed, UserAlreadyExists, WrongPasswordOrEmail } from 'src/common';
import { LoginDto } from 'src/auth/dto/login.dto';
import { Request, Response } from 'express';

const { BACKEND_ROUTE, DOMAIN_NAME, TOKEN_NAME, COOKIE_EXPIRE_MS } = process.env;
const cookieExpTime = parseInt(COOKIE_EXPIRE_MS!);
const isProd = process.env.NODE_ENV === 'production';

export interface cookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: boolean | 'lax' | 'strict' | 'none' | undefined;
  maxAge: number;
  path?: string;
  domain?: string;
}

const cookieOptions: cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  maxAge: cookieExpTime,
  path: BACKEND_ROUTE + '/',
  domain: isProd ? DOMAIN_NAME : undefined,
};

@Controller({ path: '/auth' })
export class AuthController {
  constructor(private readonly userService: AuthService) {}

  @Post('/admin/register')
  async adminRegister(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const data = await this.userService.adminRegister(body, req);

      res.cookie(TOKEN_NAME!, data.refreshToken, cookieOptions);

      const { refreshToken, ...rest } = data;

      return rest;
    } catch (error) {
      if (error instanceof NotAllowed || error instanceof UserAlreadyExists) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution user.controller/adminRegister:', error);
      throw new InternalServerErrorException();
    }
  }

  @Post('/register')
  async register(@Body() body: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const data = await this.userService.register(body, req);
      const { refreshToken, accessToken } = data;

      res.cookie(TOKEN_NAME!, refreshToken, cookieOptions);

      return { accessToken };
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
  async login(@Body() body: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const data = await this.userService.login(body, req);

      res.cookie(TOKEN_NAME!, data.refreshToken, cookieOptions);

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

  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(TOKEN_NAME!, cookieOptions);

    return { message: 'Logged out successfully' };
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const token = req.cookies[TOKEN_NAME!];

      if (!token) throw new BadRequestException('No refresh token in cookies');

      const data = await this.userService.refresh(token);

      res.cookie(TOKEN_NAME!, data.refreshToken, cookieOptions);

      const { accessToken } = data;

      return { accessToken };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution auth.controller.ts:', error);
    }
  }
}
