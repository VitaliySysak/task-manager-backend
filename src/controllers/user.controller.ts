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
import { UserService } from '../service/user.service';
import { RegisterDto } from 'src/models/register.dto';

@Controller({ path: '/users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  getAll() {
    return this.userService.getAll();
  }

  @Get()
  getOne(@Query('id', ParseIntPipe) id: number) {
    return this.userService.getOne(id);
  }

  @Post('/register')
  register(@Body() body: RegisterDto) {
    return this.userService.register(body);
  }
}
