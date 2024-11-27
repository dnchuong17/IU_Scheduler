import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ScheduleTemplateService } from '../service/scheduleTemplate.service';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import { CreateSchedulerDto } from '../dto/createScheduler.dto';

@Controller('scheduleTemplate')
export class SchedulerTemplateController {
  constructor(
    private readonly templateService: ScheduleTemplateService,
    private readonly logger: TracingLoggerService,
  ) {
    logger.setContext(SchedulerTemplateController.name);
  }

  @Get(':id')
  getTemplate(@Param('id') id: number) {
    return this.templateService.getTemplate(id);
  }

  @Post('create')
  createTemplate(@Body() createSchedulerDto: CreateSchedulerDto) {
    try {
      this.logger.debug('[CREATE TEMPLATE]: Receive request creating template');
      return this.templateService.createTemplate(createSchedulerDto);
    } catch (error) {
      throw new BadRequestException('Cant sync data from schedule');
    }
  }
}
