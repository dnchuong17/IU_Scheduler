import { DeadlineService } from '../service/deadline.service';
import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { DeadlineDto } from '../dto/deadline.dto';

@Controller('deadline')
export class DeadlineController {
  constructor(private readonly deadlineService: DeadlineService) {}

  @Get()
  getAllDeadline() {
    return this.deadlineService.getAllDeadline();
  }

  @Post('create')
  createNewDeadline(@Body() deadlineDto: DeadlineDto) {
    return this.deadlineService.createDeadline(deadlineDto);
  }

  @Patch('detail/:id')
  activeAlert(@Body() deadlineDto: DeadlineDto, @Param('id') id: number) {
    return this.deadlineService.activeAlert(deadlineDto, id);
  }

  @Get(':id')
  getDeadlineById(@Param('id') id: number) {
    return this.deadlineService.getDeadlineById(id);
  }

  @Get('by-course-value/:courseValueId')
  getDeadlineByCoursealueId(@Param('courseValueId') courseValueId: number) {
    return this.deadlineService.getDeadlineByCourseValueId(courseValueId);
  }

  @Delete('delete/:id')
  deleteDeadline(@Param('id') id: number) {
    return this.deadlineService.deleteDeadline(id);
  }
}
