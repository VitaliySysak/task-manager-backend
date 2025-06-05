import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { RegisterDto, RegisterResponseDto } from 'src/auth/dto/register.dto';
import { GoogleLoginDto, LoginDto, LoginResponseDto } from 'src/auth/dto/login.dto';
import { NotAllowed, UserAlreadyExists, WrongPasswordOrEmail } from 'src/common';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TaskService } from 'src/task/task.service';
import { ConfigType } from '@nestjs/config';
import { refreshJwtConfig, refreshJwtConfigKey } from './config/refresh-jwt.config';
import { accessJwtConfig, accessJwtConfigKey } from './config/access-jwt.config';
import { CalendarDto } from './dto/calendar.dto';
import axios from 'axios';

const { COOKIE_EXPIRE_MS } = process.env;
const cookieExpTime = parseInt(COOKIE_EXPIRE_MS!);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private taskService: TaskService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfigKey) private readonly refreshConfig: ConfigType<typeof refreshJwtConfig>,
    @Inject(accessJwtConfigKey) private readonly accessConfig: ConfigType<typeof accessJwtConfig>,
  ) {}

  async adminRegister(body: RegisterDto, req: Request): Promise<RegisterResponseDto> {
    const { fullName, email, password } = body;

    const isUserExist = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (isUserExist) {
      throw new UserAlreadyExists(`Admin with email ${email} already exists`);
    }

    if (password !== process.env.ADMIN_PASSWORD!) {
      throw new NotAllowed(`Wrong admin password`);
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: { fullName, email, password: hashedPassword },
    });

    const refreshToken = this.jwtService.sign({ sub: user.id }, this.refreshConfig);
    const accessToken = this.jwtService.sign({ sub: user.id }, this.accessConfig);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + cookieExpTime),
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null,
      },
    });

    const initTask = {
      title: 'task example',
      description: 'a little description for this task',
    };

    await this.taskService.create(initTask, user);

    return {
      id: user.id,
      fullName,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  async register(newUser: RegisterDto, req: Request): Promise<RegisterResponseDto> {
    const { fullName, email, password } = newUser;

    const isUserExist = await this.prisma.user.findFirst({
      where: { email },
    });

    if (isUserExist) {
      throw new UserAlreadyExists(`User with email ${email} already exists`);
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    const refreshToken = this.jwtService.sign({ sub: user.id }, this.refreshConfig);
    const accessToken = this.jwtService.sign({ sub: user.id }, this.accessConfig);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + cookieExpTime),
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null,
      },
    });

    const initTask = {
      title: 'task example',
      description: 'a little description for this task',
    };

    await this.taskService.create(initTask, user);

    return {
      id: user.id,
      fullName,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  async login(newUser: LoginDto, req: Request): Promise<LoginResponseDto> {
    const { email, password } = newUser;

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user || !(await compare(password, user.password))) {
      throw new WrongPasswordOrEmail('Wrong email or password');
    }

    const refreshToken = this.jwtService.sign({ sub: user.id }, this.refreshConfig);
    const accessToken = this.jwtService.sign({ sub: user.id }, this.accessConfig);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + cookieExpTime),
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null,
      },
    });

    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    try {
      this.jwtService.verify(refreshToken, { secret: this.refreshConfig.secret });

      const session = await this.prisma.userSession.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new BadRequestException('Refresh token is invalid or expired');
      }

      const user = session.user;

      const newRefreshToken = this.jwtService.sign({ sub: user.id }, this.refreshConfig);
      const newAccessToken = this.jwtService.sign({ sub: user.id }, this.accessConfig);

      await this.prisma.userSession.update({
        where: { refreshToken },
        data: {
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + cookieExpTime),
        },
      });

      return {
        id: user.id,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Cannot refresh accessToken');
    }
  }

  async calendarRefresh(googleCalendarRefreshToken: string) {
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_ID!);
    params.append('client_secret', process.env.GOOGLE_SECRET!);
    params.append('refresh_token', googleCalendarRefreshToken);
    params.append('grant_type', 'refresh_token');

    const response = (await axios.post('https://oauth2.googleapis.com/token', params)).data;

    return response['access_token'];
  }

  async validateGoogleUser(googleUser: GoogleLoginDto) {
    const { fullName, email, password, googleAccessToken } = googleUser;

    const isExist = await this.prisma.user.findFirst({ where: { email: googleUser.email } });
    if (isExist) {
      return isExist;
    }

    const newUser = await this.prisma.user.create({ data: { fullName, email, password } });

    const initTask = {
      title: 'task example',
      description: 'a little description for this task',
    };

    await this.taskService.create(initTask, newUser);

    return googleUser;
  }

  async loginWithGoogle(googleUser: GoogleLoginDto, req: Request) {
    const { email, provider, providerId, googleAccessToken } = googleUser;

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new WrongPasswordOrEmail('Wrong email or password');
    }

    const refreshToken = this.jwtService.sign({ sub: user.id }, this.refreshConfig);
    const accessToken = this.jwtService.sign({ sub: user.id }, this.accessConfig);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        provider,
        providerId,
        verified: new Date(),
        expiresAt: new Date(Date.now() + cookieExpTime),
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null,
      },
    });

    return refreshToken;
  }

  async loginGoogleCalendar(data: CalendarDto, refreshToken: string) {
    const { googleCalendarRefreshToken } = data;

    await this.prisma.userSession.update({
      where: { refreshToken },
      data: {
        googleCalendarRefreshToken,
      },
    });

    return googleCalendarRefreshToken;
  }
}
