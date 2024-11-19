import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CoursesEntity } from '../../courses/entity/courses.entity';

export class CourseValueDto {
  @IsNumber()
  @IsNotEmpty()
  startPeriod: number;

  @IsString()
  @IsNotEmpty()
  lecture: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  dayOfWeek: string;

  group: number;
  labGroup: number;
  numberOfPeriods: number;
  courses: CoursesEntity;
}
