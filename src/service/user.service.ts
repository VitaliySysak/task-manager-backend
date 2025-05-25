import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Admin
  async getAll(user: User): Promise<User[]> {
    if (user.role !== UserRole.ADMIN) {
      throw new NotAllowed('Only admins can access this route');
    }

    const allUsers = await this.prisma.user.findMany();

    return allUsers;
  }

  async adminRegister(body: RegisterDto): Promise<RegisterResponseDto> {
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

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { token, role: UserRole.ADMIN },
    });

    return { id: user.id, fullName, email, role: UserRole.ADMIN, token };
  }

  // User
  async register(newUser: RegisterDto): Promise<RegisterResponseDto> {
    const { fullName, email, password } = newUser;

    const isUserExist = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (isUserExist) {
      throw new UserAlreadyExists(`User with email ${email} already exists`);
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: { fullName, email, password: hashedPassword },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    const prisma = new PrismaService();
    const taskService = new TaskService(prisma);

    const initTask = {
      title: 'task example',
      description: 'a little descrioption for this task',
    };

    await taskService.create(initTask, user);

    return { id: user.id, fullName, email, role: UserRole.USER, token };
  }

  async login(newUser: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = newUser;

    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user || !(await compare(password, user.password))) {
      throw new WrongPasswordOrEmail(`Wrong email or password`);
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    return { id: user.id, email, role: UserRole.USER, token };
  }
}
