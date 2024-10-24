import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from './schedulerTemplate.entity';
import { ScheduleTemplateService } from './scheduleTemplate.service';

@Module({
  imports: [TypeOrmModule.forFeature([SchedulerTemplateEntity])],
  controllers: [],
  providers: [ScheduleTemplateService],
  exports: [ScheduleTemplateService],
})
export class ScheduleTemplateModule {}
