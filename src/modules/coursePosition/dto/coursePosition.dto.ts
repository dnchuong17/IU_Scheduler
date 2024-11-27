import { IsNotEmpty, IsNumber } from 'class-validator';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/entity/schedulerTemplate.entity';

export class CoursePositionDto {
  @IsNumber()
  @IsNotEmpty()
  days: string;

  @IsNumber()
  @IsNotEmpty()
  periods: number;
  startPeriod: number;

  scheduler: SchedulerTemplateEntity;
}
