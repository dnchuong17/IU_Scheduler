export class CreateTemplateItemDto {
  id: number;
  courseID: string;
  courseName: string;
  date: string;
  startPeriod: number;
  periodsCount: number;
  credits: number;
  location: string;
  lecturer: string;
  isActive: boolean;
}
