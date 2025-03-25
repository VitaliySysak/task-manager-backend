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

@Controller({ path: '/users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getAll(@Req() req: Request) {
    try {
      const password = req.headers['authorization'].replace('Bearer ', '').trim();

      const allUsers = await this.userService.getAll(password);

      return allUsers;
    } catch (error) {
      if (error instanceof NotAllowed) {
        throw new BadRequestException(error.message);
      }
      console.error('Error while execution user.controller/getAll:', error);
      throw new InternalServerErrorException();
    }
  }

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
  async login(@Body() body: RegisterDto) {
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
