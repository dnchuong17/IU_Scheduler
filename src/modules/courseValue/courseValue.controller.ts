import { Body, Controller, Get, Post } from "@nestjs/common";
import { CourseValueDto } from './courseValue.dto';
import { CourseValueService } from "./courseValue.service";

@Controller('courseValue')
export class CourseValueController {
  constructor(private readonly courseValueService: CourseValueService) {}

  @Post('create')
  async createCourseValue(@Body() courseValueDto: CourseValueDto) {
    return await this.courseValueService.createCourseValue(courseValueDto);
  }
}
