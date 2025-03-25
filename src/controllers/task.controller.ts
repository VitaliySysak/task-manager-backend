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
} from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { CreateTaskDto } from 'src/models/task/create-task.dto';
import { User } from '@prisma/client';
import { TaskAlreadyExists } from 'src/common';

@Controller({ path: '/tasks' })
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('/')
  getAll() {
    return this.taskService.getAll();
  }

  @Get(':id')
  getOne(@Param(':id') id: number) {
    return this.taskService.getOne(id);
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
        throw new BadRequestException(error.message);
      } else {
        console.error('Error while execution task.controller/create:', error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() body: any) {
    return this.taskService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.taskService.delete(id);
  }
}
