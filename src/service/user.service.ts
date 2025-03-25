import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { RegisterDto, RegisterResponseDto } from 'src/models/user/register.dto';
import { LoginDto, LoginResponseDto } from 'src/models/user/login.dto';
import {
  NotAllowed,
  UserAlreadyExists,
  WrongPasswordOrEmail,
} from 'src/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAll(password: string): Promise<User[]> {
    if (password !== process.env.ADMIN_PASSWORD!) {
      throw new NotAllowed(`Wrong admin password`);
    }

    const allUsers = await this.prisma.user.findMany();

    return allUsers;
  }

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
    const token = crypto.randomUUID();

    const user = await this.prisma.user.create({
      data: { fullName, email, token, password: hashedPassword },
    });

    return { id: user.id, fullName, email, token };
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

    return { id: user.id, email, token: user.token };
  }
}
