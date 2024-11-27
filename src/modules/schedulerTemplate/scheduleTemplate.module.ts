import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleTemplateService } from './service/scheduleTemplate.service';
import { SchedulerTemplateController } from './controller/schedulerTemplate.controller';
import { TracingLoggerModule } from '../../logger/tracinglogger.module';
import { TracingLoggerService } from '../../logger/tracing-logger.service';
import { UserModule } from '../user/user.module';
import { SchedulerTemplateEntity } from './entity/schedulerTemplate.entity';
import { UserService } from '../user/service/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchedulerTemplateEntity]),
    forwardRef(() => UserModule),
    TracingLoggerModule,
  ],
  controllers: [SchedulerTemplateController],
  providers: [ScheduleTemplateService, TracingLoggerService, UserService],
  exports: [ScheduleTemplateService, TypeOrmModule],
})
export class ScheduleTemplateModule {}
