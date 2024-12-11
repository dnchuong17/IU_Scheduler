import { IsString } from 'class-validator';
import { CoursesEntity } from '../../courses/entity/courses.entity';

export class NoteDto {
  @IsString()
  description: string;

  course: CoursesEntity;
}
