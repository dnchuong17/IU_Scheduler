import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { HealthModule } from './health/health.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { RedisModule } from './modules/redis/redis.module';
import { RedisConfig } from './modules/redis/dtos/redis-creation.dto';
import * as dotenv from 'dotenv';
import { ScheduleTemplateModule } from './modules/schedulerTemplate/scheduleTemplate.module';
import { TracingLoggerModule } from './logger/tracinglogger.module';
import { AuthModule } from './auth/auth.module';
import { DeadlineModule } from './modules/deadline/deadline.module';
import { TracingLoggerMiddleware } from './logger/tracing-logger.middleware';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.register({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      accessKey: process.env.REDIS_ACCESS_KEY,
    } as RedisConfig),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    HealthModule,
    UserModule,
    AuthModule,
    ScheduleTemplateModule,
    TracingLoggerModule,
    DeadlineModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TracingLoggerMiddleware).forRoutes('*');
  }
}
