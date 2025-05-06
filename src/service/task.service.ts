import { Injectable, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, User } from '@prisma/client';
import { CreateTaskDto } from 'src/models/task/create-task.dto';
import { NotAllowed, TaskAlreadyExists, TaskNotFound } from 'src/common';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  // Admin
  async getAllUsersTasks(user: User): Promise<Task[]> {
    if (user.role !== 'ADMIN') {
      throw new NotAllowed('Only admins can access this route');
    }

    const allUsersTasks = await this.prisma.task.findMany();

    return allUsersTasks;
  }

  // User
  async getAllUserTasks(
    user: User,
    status?: TaskStatus,
    title?: string,
    description?: string,
  ): Promise<Task[]> {
    const where: any = {
      userId: user.id,
      ...(status && { status }),
      ...(title && {
        title: { contains: title, mode: 'insensitive' },
      }),
      ...(description && {
        description: { contains: description, mode: 'insensitive' },
      }),
    };
  
    return this.prisma.task.findMany({
      where,
      orderBy: {
        createdAt: 'asc' 
      },
    });
  }

  async getOne(user: User, id: number): Promise<Task> {
    const getTask = await this.prisma.task.findFirst({
      where: { userId: user.id, id },
    });

    if (!getTask) {
      throw new TaskNotFound(`Task with id ${id} not found`);
    }
    return getTask;
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
        userId: user.id,
      },
    });
    console.log('task:', task)

    return task;
  }

  async update(id: number, updateTask: Partial<Task>): Promise<Task> {
    const task = await this.prisma.task.findFirst({ where: { id } });
    if (!task) {
      throw new TaskNotFound(`Task with id ${id} not found`);
    }

    return this.prisma.task.update({ where: { id }, data: updateTask });
  }

  async delete(id: number): Promise<Task> {
    const task = await this.prisma.task.findFirst({ where: { id } });
    if (!task) {
      throw new TaskNotFound(`Task with id ${id} not found`);
    }

    const deletedTask = await this.prisma.task.delete({ where: { id } });

    return deletedTask;
  }
}
