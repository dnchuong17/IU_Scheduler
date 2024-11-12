import { IsNotEmpty, IsNumber } from 'class-validator';

export class CoursePositionDto {
  @IsNumber()
  @IsNotEmpty()
  days: number;

  @IsNumber()
  @IsNotEmpty()
  periods: number;

  @IsNumber()
  @IsNotEmpty()
  schedulerId: number;

  @IsNumber()
  courseIds?: number[];
}
