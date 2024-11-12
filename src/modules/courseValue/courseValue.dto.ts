import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
  date: string;

  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
