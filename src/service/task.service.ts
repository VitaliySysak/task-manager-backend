import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, User } from '@prisma/client';
import { CreateTaskDto } from 'src/models/task/create-task.dto';
import { TaskAlreadyExists } from 'src/common';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Task[]> {
    return this.prisma.task.findMany();
  }

  async getOne(id: number): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async create(newTask: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = newTask;

    const isTaskExist = await this.prisma.task.findFirst({
      where: {
        title,
        userId: user.id,
      },
    });

    if (isTaskExist) {
      throw new TaskAlreadyExists(`Task with title ${title} already exists`);
    }

    const task = await this.prisma.task.create({
      data: {
        title,
        description: description ?? '',
        status: false,
        userId: user.id,
      },
    });

    return task;
  }

  async update(id: number, data: Partial<Task>): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }
}
