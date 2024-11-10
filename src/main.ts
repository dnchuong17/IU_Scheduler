import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { TracingLoggerMiddleware } from './logger/tracing-logger.middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  app.use(helmet());
  app.use(cookieParser());
  app.use(TracingLoggerMiddleware);
  const logger = new Logger();
  logger.log('Server is running in http://localhost:3000.');
}
bootstrap();
