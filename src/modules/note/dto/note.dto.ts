import { CourseValueEntity } from '../../courseValue/entity/courseValue.entity';

export class NoteDto {
  content?: string;
  courseValue: CourseValueEntity;
}