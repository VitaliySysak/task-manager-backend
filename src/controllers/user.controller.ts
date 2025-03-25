import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { RegisterDto } from 'src/models/user/register.dto';
import {
  NotAllowed,
  UserAlreadyExists,
  WrongPasswordOrEmail,
} from 'src/common';
import { User } from '@prisma/client';
import { LoginDto } from 'src/models/user/login.dto';

@Controller({ path: '/users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Admin
  @Get('/all')
  async getAll(@Req() req: Request & { user: User }) {
    try {
      const { user } = req;

      const allUsers = await this.userService.getAll(user);

      return allUsers;
    } catch (error) {
      if (error instanceof NotAllowed) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution user.controller/getAll:', error);
      throw new InternalServerErrorException();
    }
  }

  @Post('/admin/register')
  async adminRegister(@Body() body: RegisterDto) {
    try {
      const allUsers = await this.userService.adminRegister(body);

      return allUsers;
    } catch (error) {
      if (error instanceof NotAllowed || error instanceof UserAlreadyExists) {
        throw new BadRequestException(error.message);
      }
      console.error(
        'Error while execution user.controller/adminRegister:',
        error,
      );
      throw new InternalServerErrorException();
    }
  }

  // User
  @Post('/register')
  async register(@Body() body: RegisterDto) {
    try {
      const data = await this.userService.register(body);

      return data;
    } catch (error) {
      if (error instanceof UserAlreadyExists) {
        throw new BadRequestException(error.message);
      } else {
        console.error('Error while execution user.controller/register:', error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    try {
      const data = await this.userService.login(body);

      return data;
    } catch (error) {
      if (error instanceof WrongPasswordOrEmail) {
        throw new BadRequestException(error.message);
      } else {
        console.error('Error while execution user.controller/login:', error);
        throw new InternalServerErrorException();
      }
    }
  }
}
