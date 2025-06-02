import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TaskModule } from 'src/task/task.module';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { refreshJwtConfig } from './config/refresh-jwt.config';
import { accessJwtConfig } from './config/access-jwt.config';
import { JwtModule } from '@nestjs/jwt';
import googleOauthConfig from './config/google-oauth-config';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    PrismaModule,
    TaskModule,
    JwtModule,
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(accessJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
