import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, User } from '@prisma/client';
import { CreateGoogleTaskDataDto, CreateGoogleTaskDto, CreateTaskDto } from 'src/task/dto/create-task.dto';
import { NotAllowed, TaskAlreadyExists, TaskNotFound } from 'src/common';
import { TaskStatus } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

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
        createdAt: 'asc',
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
    const { title, description, isCompleted } = newTask;

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
        status: isCompleted ? TaskStatus.DONE : TaskStatus.TODO,
        userId: user.id,
      },
    });

    return task;
  }

  async updateById(id: number, updateTask: Partial<Task>): Promise<Task> {
    const task = await this.prisma.task.findFirst({ where: { id } });
    if (!task) {
      throw new TaskNotFound(`Task with id ${id} not found`);
    }

    return this.prisma.task.update({ where: { id }, data: updateTask });
  }

  async deleteById(id: number): Promise<Task> {
    const task = await this.prisma.task.findFirst({ where: { id } });
    if (!task) {
      throw new TaskNotFound(`Task with id ${id} not found`);
    }

    const deletedTask = await this.prisma.task.delete({ where: { id } });

    return deletedTask;
  }

  async deleteCompletedByIds(ids: number[]): Promise<number[]> {
    await this.prisma.task.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return ids;
  }

  async createWithGoogleEvent(taskData: CreateGoogleTaskDataDto, user: User): Promise<Task> {
    const { title, description, isCompleted, startEventTime, endEventTime } = taskData.newTask;

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
        status: isCompleted ? TaskStatus.DONE : TaskStatus.TODO,
        userId: user.id,
      },
    });

    const now = new Date();
    const defaultStartTime = new Date(now.getTime() + 60 * 60 * 1000);
    const defaultEndTime = new Date(now.getTime() + 120 * 60 * 1000);

    const defaultStandartEndTime = startEventTime
      ? new Date(startEventTime.getTime() + 60 * 60 * 1000)
      : defaultEndTime;

    const googleResponse = (
      await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          summary: title,
          description,
          start: {
            dateTime: (startEventTime ?? defaultStartTime).toISOString(),
          },
          end: {
            dateTime: (endEventTime ?? defaultStandartEndTime).toISOString(),
          },
        },
        {
          headers: { Authorization: `Bearer ${taskData.googleAccessToken}` },
        },
      )
    ).data;

    console.log({ googleResponse });

    return task;
  }
}
