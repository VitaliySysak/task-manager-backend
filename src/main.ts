import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.use(cookieParser());
  app.enableCors({ origin: process.env.FRONTEND_SERVER, credentials: true });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
