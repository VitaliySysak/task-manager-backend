import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './service/task.service';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaskController, UserController],
  providers: [TaskService, UserService],
})
export class AppModule {}
