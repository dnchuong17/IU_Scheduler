import { CreateTemplateItemDto } from './createTemplateItem.dto';

export class CreateSchedulerDto {
  studentId: string;
  templateId: number;
  listOfCourses: CreateTemplateItemDto[];
}
