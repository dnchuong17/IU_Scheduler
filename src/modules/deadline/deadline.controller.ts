import { DeadlineService } from './deadline.service';
import { Body, Get, Param, Post } from '@nestjs/common';
import { DeadlineDto } from './deadline.dto';

export class DeadlineController {
  constructor(private readonly deadlineService: DeadlineService) {}

  @Get()
  getAllDeadline() {
    return this.deadlineService.getAllDeadline();
  }

  @Post()
  createNewDeadline(@Body() deadlineDto: DeadlineDto) {
    return this.deadlineService.createDeadline(deadlineDto);
  }

  @Post('/id')
  activeAlert(@Body() deadlineDto: DeadlineDto, @Param('id') id: number) {
    return this.deadlineService.activeAlert(deadlineDto, id);
  }
}
