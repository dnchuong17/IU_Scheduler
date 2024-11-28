import { IsNotEmpty, IsNumber } from 'class-validator';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/entity/schedulerTemplate.entity';
import { CoursesEntity } from '../../courses/entity/courses.entity';

export class CoursePositionDto {
  @IsNumber()
  @IsNotEmpty()
  days: string;

  @IsNumber()
  @IsNotEmpty()
  periods: number;
  startPeriod: number;
  courses: CoursesEntity;

  scheduler: SchedulerTemplateEntity;
}
