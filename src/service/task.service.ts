import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Task[]> {
    return this.prisma.task.findMany();
  }

  async getOne(id: number): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async create(data: { title: string; description: string }): Promise<Task> {
    return this.prisma.task.create({
      data: { title: data.title, description: data.description, status: false },
    });
  }

  async update(id: number, data: Partial<Task>): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }
}
