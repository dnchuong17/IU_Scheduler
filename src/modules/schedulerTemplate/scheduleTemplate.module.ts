import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from './entity/schedulerTemplate.entity';
import { ScheduleTemplateService } from './service/scheduleTemplate.service';
import { SchedulerTemplateController } from './controller/schedulerTemplate.controller';
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
