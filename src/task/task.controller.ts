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
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from '../task/task.service';
import { CreateGoogleTaskDataDto, CreateGoogleTaskDto, CreateTaskDto } from 'src/task/dto/create-task.dto';
import { User } from '@prisma/client';
import { NotAllowed, TaskAlreadyExists, TaskNotFound } from 'src/common';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto';
import { FindTasksQueryDto } from 'src/task/dto/find-task.dto';
import { DeleteTasksDto } from 'src/task/dto/delete-tasks.dto';
import { Request } from 'express';

const { GOOGLE_CALENDAR_TOKEN_NAME } = process.env;

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
      console.error('Error while execution task.controller/getAllUsersTasks:', error);
      throw new InternalServerErrorException();
    }
  }

  @Get('/')
  async getAllUserTasks(@Req() req: Request & { user: User }, @Query() query: FindTasksQueryDto) {
    try {
      const { user } = req;
      const { title, description, status } = query;

      const allUserTasks = await this.taskService.getAllUserTasks(user, status, title, description);

      return allUserTasks;
    } catch (error) {
      console.error('Error while execution task.controller/getAllUserTasks:', error);
      throw new InternalServerErrorException();
    }
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id, @Req() req: Request & { user: User }) {
    try {
      const { user } = req;

      const getTask = await this.taskService.getOne(user, id);

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
  async create(@Body() body: CreateTaskDto, @Req() req: Request & { user: User }) {
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
  async updateById(@Param('id', ParseIntPipe) id, @Body() body: UpdateTaskDto) {
    try {
      const updatedTask = await this.taskService.updateById(id, body);

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
  async deleteById(@Param('id', ParseIntPipe) id) {
    try {
      const deletedTask = await this.taskService.deleteById(id);

      return deletedTask;
    } catch (error) {
      if (error instanceof TaskNotFound) {
        throw new NotFoundException(error.message);
      }
      console.error('Error while execution task.controller/delete:', error);
      throw new InternalServerErrorException();
    }
  }

  @Post('/delete-many')
  async deleteCompletedByIds(@Body() body: DeleteTasksDto) {
    try {
      const { ids } = body;
      const tasksId = await this.taskService.deleteCompletedByIds(ids);

      return { tasksId };
    } catch (error) {
      console.error('Error while execution deleteCompletedByIds:', error);
      throw new InternalServerErrorException();
    }
  }

  @Post('/create-event')
  async createWithGoogleEvent(@Body() body: CreateGoogleTaskDataDto, @Req() req: Request & { user: User }) {
    try {
      const { user } = req;

      const task = await this.taskService.createWithGoogleEvent(body, user);

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
}
