import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TaskService } from '../service/task.service';

@Controller({ path: '/tasks' })
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('/all')
  getAll() {
    return this.taskService.getAll();
  }

  @Get()
  getOne(@Query('id', ParseIntPipe) id: number) {
    return this.taskService.getOne(id);
  }

  @Post('/')
  create(@Body() body: { title: string; description: string }) {
    return this.taskService.create(body);
  }

  @Put(':id')
  update(@Query('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.taskService.update(id, body);
  }

  @Delete(':id')
  delete(@Query('id', ParseIntPipe) id: number) {
    return this.taskService.delete(id);
  }
}
