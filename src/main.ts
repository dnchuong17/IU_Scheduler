import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { TracingLoggerMiddleware } from './logger/tracing-logger.middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(3000);
  app.use(helmet());
  app.use(cookieParser());
  app.use(TracingLoggerMiddleware);
  app.setGlobalPrefix('/api');
  const logger = new Logger();
  logger.log('Server is running in http://localhost:3000.');
  app.enableCors({
    origin: [
      'https://alert-server-production-937d.up.railway.app',
      'http://localhost:5173',
    ],
    allowedHeaders: ['Content-Type, Authorization'],
    credentials: true,
  });
}
bootstrap();
