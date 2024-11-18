import { Body, Controller, Post } from '@nestjs/common';
import { CoursesDto } from './courses.dto';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courseService: CoursesService) {}

  // @Post('create')
  // async createCourse(@Body() courseDto: CoursesDto) {
  //   return this.courseService.createCourse(courseDto);
  // }
}
