import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from './entity/schedulerTemplate.entity';
import { ScheduleTemplateService } from './service/scheduleTemplate.service';
import { SchedulerTemplateController } from './controller/schedulerTemplate.controller';
import { TracingLoggerModule } from '../../logger/tracinglogger.module';
import { TracingLoggerService } from '../../logger/tracing-logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchedulerTemplateEntity]),
    TracingLoggerModule,
  ],
  controllers: [SchedulerTemplateController],
  providers: [ScheduleTemplateService, TracingLoggerService],
  exports: [ScheduleTemplateService, TypeOrmModule],
})
export class ScheduleTemplateModule {}
