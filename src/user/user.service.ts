import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { NotAllowed } from 'src/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Admin
  async getAll(user: User): Promise<User[]> {
    if (user.role !== UserRole.ADMIN) {
      throw new NotAllowed('Only admins can access this route');
    }

    const allUsers = await this.prisma.user.findMany();

    return allUsers;
  }
}
