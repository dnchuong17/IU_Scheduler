import { Body, Controller, Post } from '@nestjs/common';
import { CoursePositionService } from '../service/coursePosition.service';
import { CoursePositionDto } from '../dto/coursePosition.dto';

@Controller('coursePosition')
export class CoursePositionController {
  constructor(private readonly coursePositionService: CoursePositionService) {}

  @Post('create')
  async createCoursePosition(@Body() coursePositionDto: CoursePositionDto) {
    return this.coursePositionService.createCoursePosition(coursePositionDto);
  }
}
