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
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRE_IN,
      },
    }),
    TaskModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
