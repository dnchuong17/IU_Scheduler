import { IsNotEmpty, IsNumber } from 'class-validator';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/entity/schedulerTemplate.entity';

export class CoursePositionDto {
  @IsNumber()
  @IsNotEmpty()
  days: number;

  @IsNumber()
  @IsNotEmpty()
  periods: number;

  scheduler: SchedulerTemplateEntity;
}
