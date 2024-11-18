import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,

} from 'class-validator';

export class CoursesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  credits: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  periods: number;

  @IsNumber()
  @IsNotEmpty()
  startPeriod?: number;

}
