import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './service/task.service';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';
import { UserAuthorizationMiddleware } from './middleware/userAuthorization.middleware';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './controllers/app.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [TaskController, UserController, AppController],
  providers: [TaskService, UserService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthorizationMiddleware)
      .forRoutes('/tasks', '/users/all');
  }
}
