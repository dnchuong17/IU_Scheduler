import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CoursesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  credits: number;

  @IsNumber()
  @IsNotEmpty()
  periods: number;
}
