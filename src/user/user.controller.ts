import { BadRequestException, Controller, Get, InternalServerErrorException, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { NotAllowed } from 'src/common';

@Controller('/users')
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
}
