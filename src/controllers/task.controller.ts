import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Query,
} from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { CreateTaskDto } from 'src/models/task/create-task.dto';
import { User } from '@prisma/client';
import { NotAllowed, TaskAlreadyExists, TaskNotFound } from 'src/common';
import { UpdateTaskDto } from 'src/models/task/update-task.dto';
import { FindTasksQueryDto } from 'src/models/task/find-task.dto';

@Controller({ path: '/tasks' })
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Admin
  @Get('/all')
  async getAllUsersTasks(@Req() req: Request & { user: User }) {
    try {
      const { user } = req;

      const allUsersTasks = await this.taskService.getAllUsersTasks(user);

      return allUsersTasks;
    } catch (error) {
      if (error instanceof NotAllowed) {
        throw new BadRequestException(error.message);
      }
      console.error(
        'Error while execution task.controller/getAllUsersTasks:',
        error,
      );
      throw new InternalServerErrorException();
    }
  }

  // User
  @Get('/')
  async getAllUserTasks(
    @Req() req: Request & { user: User },
    @Query() query: FindTasksQueryDto,
  ) {
    try {
      const { user } = req;
      const { title, description, status } = query;

      const allUserTasks = await this.taskService.getAllUserTasks(
        user,
        status,
        title,
        description,
      );

      return allUserTasks;
    } catch (error) {
      console.error(
        'Error while execution task.controller/getAllUserTasks:',
        error,
      );
      throw new InternalServerErrorException();
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: Request & { user: User }) {
    try {
      const { user } = req;

      const getTask = await this.taskService.getOne(user, Number(id));

      return getTask;
    } catch (error) {
      if (error instanceof TaskNotFound) {
        throw new NotFoundException(error.message);
      }
      console.error('Error while execution task.controller/getOne:', error);
      throw new InternalServerErrorException();
    }
  }

  @Post('/')
  async create(
    @Body() body: CreateTaskDto,
    @Req() req: Request & { user: User },
  ) {
    try {
      const { user } = req;

      const task = await this.taskService.create(body, user);

      return task;
    } catch (error) {
      if (error instanceof TaskAlreadyExists) {
        throw new ConflictException(error.message);
      } else {
        console.error('Error while execution task.controller/create:', error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: UpdateTaskDto) {
    try {
      const updatedTask = await this.taskService.update(Number(id), body);

      return updatedTask;
    } catch (error) {
      if (error instanceof TaskNotFound) {
        throw new NotFoundException(error.message);
      }
      console.error('Error while execution task.controller/update:', error);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    try {
      const deletedTask = await this.taskService.delete(Number(id));

      return deletedTask;
    } catch (error) {
      if (error instanceof TaskNotFound) {
        throw new NotFoundException(error.message);
      }
      console.error('Error while execution task.controller/delete:', error);
      throw new InternalServerErrorException();
    }
  }
}
