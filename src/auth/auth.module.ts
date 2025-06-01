import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { TaskModule } from 'src/task/task.module';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
    }),
    TaskModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
