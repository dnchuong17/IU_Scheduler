import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from './schedulerTemplate.entity';
import { ScheduleTemplateService } from './scheduleTemplate.service';
import { SchedulerTemplateController } from './schedulerTemplate.controller';
import { TracingLoggerModule } from '../../logger/tracinglogger.module';
import { TracingLoggerService } from '../../logger/tracing-logger.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchedulerTemplateEntity]),
    forwardRef(() => UserModule),
    TracingLoggerModule,
  ],
  controllers: [SchedulerTemplateController],
  providers: [ScheduleTemplateService, TracingLoggerService],
  exports: [ScheduleTemplateService, TypeOrmModule],
})
export class ScheduleTemplateModule {}
