import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async register(data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<User> {
    const { fullName, email, password } = data;

    return this.prisma.user.create({
      data: { fullName, email, password },
    });
  }
}
