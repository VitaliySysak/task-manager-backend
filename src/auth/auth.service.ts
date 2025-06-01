import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { RegisterDto, RegisterResponseDto } from 'src/auth/dto/register.dto';
import { LoginDto, LoginResponseDto } from 'src/auth/dto/login.dto';
import { NotAllowed, UserAlreadyExists, WrongPasswordOrEmail } from 'src/common';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TaskService } from 'src/task/task.service';

const { COOKIE_EXPIRE_MS } = process.env;
const cookieExpTime = parseInt(COOKIE_EXPIRE_MS!);

const exp = process.env.JWT_REFRESH_EXPIRE_IN
console.log({exp})

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private taskService: TaskService,
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

    const accessToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_IN },
    );
    const refreshToken = this.jwtService.sign({ sub: user.id });

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

    const accessToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_IN },
    );
    const refreshToken = this.jwtService.sign({ sub: user.id });

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

    const accessToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_IN },
    );
    const refreshToken = this.jwtService.sign({ sub: user.id });

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
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    try {
      this.jwtService.verify(refreshToken);

      const session = await this.prisma.userSession.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new BadRequestException('Refresh token is invalid or expired');
      }

      const user = session.user;

      const newAccessToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: process.env.JWT_REFRESH_EXPIRE_IN },
      );
      const newRefreshToken = this.jwtService.sign({ sub: user.id });

      await this.prisma.userSession.update({
        where: { refreshToken },
        data: {
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + cookieExpTime),
        },
      });

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Cannot refresh accessToken');
    }
  }
}
