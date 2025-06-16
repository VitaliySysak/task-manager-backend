import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Req,
  Res,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { NotAllowed, UserAlreadyExists, WrongPasswordOrEmail } from 'src/common';
import { GoogleLoginDto, LoginDto } from 'src/auth/dto/login.dto';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google.auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CalendarDto } from './dto/calendar.dto';

const {
  BACKEND_ROUTE,
  DOMAIN_NAME,
  REFRESH_TOKEN_NAME,
  GOOGLE_CALENDAR_TOKEN_NAME,
  COOKIE_EXPIRE_MS,
  FRONTEND_URL,
} = process.env;
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
  constructor(private readonly authService: AuthService) {}

  @Post('/admin/register')
  async adminRegister(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const data = await this.authService.adminRegister(body, req);

      res.cookie(REFRESH_TOKEN_NAME!, data.refreshToken, cookieOptions);

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
      const data = await this.authService.register(body, req);
      const { refreshToken, accessToken } = data;

      res.cookie(REFRESH_TOKEN_NAME!, refreshToken, cookieOptions);

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
      const data = await this.authService.login(body, req);

      res.cookie(REFRESH_TOKEN_NAME!, data.refreshToken, cookieOptions);

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
    res.clearCookie(REFRESH_TOKEN_NAME!, cookieOptions);

    return { message: 'Logged out successfully' };
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const token = req.cookies[REFRESH_TOKEN_NAME!];

      if (!token) throw new BadRequestException('No refresh token in cookies');

      const data = await this.authService.refresh(token);

      res.cookie(REFRESH_TOKEN_NAME!, data.refreshToken, cookieOptions);

      const { accessToken } = data;

      return { accessToken };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution auth.controller.ts:', error);
    }
  }

  @Get('calendar/refresh')
  async calendarRefresh(@Req() req: Request, @Res({ passthrough: true }) res) {
    try {
      const token = req.cookies[GOOGLE_CALENDAR_TOKEN_NAME!];

      console.log({ token });

      if (!token) throw new BadRequestException('No refresh google-calendar-refresh-token in cookies');

      const accessToken = await this.authService.calendarRefresh(token);

      return { accessToken };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution auth/googleCalendarCallback:', error);
    }
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res({ passthrough: true }) res) {
    const user = req.user as GoogleLoginDto;
    try {
      const refreshToken = await this.authService.loginWithGoogle(user, req);

      res.cookie(REFRESH_TOKEN_NAME!, refreshToken, cookieOptions);
      res.redirect(FRONTEND_URL!);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution auth/googleCallback:', error);
    }
  }

  @Get('calendar/connect')
  @UseGuards(AuthGuard('google-calendar'))
  async connectCalendar() {}

  @Get('calendar/callback')
  @UseGuards(AuthGuard('google-calendar'))
  async googleCalendarCallback(@Req() req: Request, @Res({ passthrough: true }) res) {
    const token = req.cookies[REFRESH_TOKEN_NAME!];
    const googleData = req.user as CalendarDto;
    try {
      const googleCalendarRefreshToken = await this.authService.loginGoogleCalendar(googleData, token);
      res.cookie(GOOGLE_CALENDAR_TOKEN_NAME!, googleCalendarRefreshToken, cookieOptions);
      res.redirect(FRONTEND_URL!);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution auth/googleCalendarCallback:', error);
    }
  }
}
