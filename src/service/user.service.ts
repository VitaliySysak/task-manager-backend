import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { RegisterDto, RegisterResponseDto } from 'src/models/user/register.dto';
import { LoginDto, LoginResponseDto } from 'src/models/user/login.dto';
import {
  NotAllowed,
  UserAlreadyExists,
  WrongPasswordOrEmail,
} from 'src/common';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TaskService } from './task.service';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private taskService: TaskService,
  ) {}

  // Admin
  async getAll(user: User): Promise<User[]> {
    if (user.role !== UserRole.ADMIN) {
      throw new NotAllowed('Only admins can access this route');
    }

    const allUsers = await this.prisma.user.findMany();

    return allUsers;
  }

  async adminRegister(
    body: RegisterDto,
    req: Request,
  ): Promise<RegisterResponseDto> {
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
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
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

  // User
  async register(
    newUser: RegisterDto,
    req: Request,
  ): Promise<RegisterResponseDto> {
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
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
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
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
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
        { sub: user.id, email: user.email },
        { expiresIn: '15m' },
      );

      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '7d' },
      );

      await this.prisma.userSession.update({
        where: { refreshToken },
        data: {
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
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
