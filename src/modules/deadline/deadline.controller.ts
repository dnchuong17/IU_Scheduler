import { DeadlineService } from './deadline.service';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { DeadlineDto } from './deadline.dto';

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

  @Patch('id')
  activeAlert(@Body() deadlineDto: DeadlineDto, @Param('id') id: number) {
    return this.deadlineService.activeAlert(deadlineDto, id);
  }
}
