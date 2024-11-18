import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { HealthModule } from './health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DeadlineModule } from './modules/deadline/deadline.module';
import { ScheduleTemplateModule } from './modules/schedulerTemplate/scheduleTemplate.module';
import { TracingLoggerModule } from './logger/tracinglogger.module';
import { TracingLoggerMiddleware } from './logger/tracing-logger.middleware';
import { CourseValueModule } from './modules/courseValue/courseValue.module';
import { CoursesModule } from "./modules/courses/course.module";
import { CoursePositionModule } from "./modules/coursePosition/coursePosition.module";

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    HealthModule,
    UserModule,
    AuthModule,
    CourseValueModule,
    CoursesModule,
    CoursePositionModule,
    ScheduleTemplateModule,
    TracingLoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
