import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserAuthorizationMiddleware } from './middleware/userAuthorization.middleware';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRE_IN,
      },
    }),
    AuthModule,
    UserModule,
    TaskModule,
    HealthModule,
  ],
  providers: [UserAuthorizationMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthorizationMiddleware).forRoutes('/users', '/tasks');
  }
}
