import { DeadlineConstant, DeadlineType } from '../../../common/deadline.constant';
import { IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';

export class DeadlineDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(DeadlineType)
  deadlineType: DeadlineType;

  @IsOptional()
  @IsEnum(DeadlineConstant)
  priority?: DeadlineConstant;

  description: string;

  @IsDate()
  date: Date;

  courseValueId: number;
}
