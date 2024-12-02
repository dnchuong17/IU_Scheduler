import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { TracingLoggerMiddleware } from './logger/tracing-logger.middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  await app.listen(3000);
  app.use(helmet());
  app.use(cookieParser());
  app.use(TracingLoggerMiddleware);
  app.setGlobalPrefix('/api');
  const logger = new Logger();
  logger.log('Server is running in http://localhost:3000.');
}
bootstrap();
