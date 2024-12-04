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
import { SchedulerTemplateDto } from '../dto/schedulerTemplate.dto';

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
  createTemplate(@Body() templateDto: SchedulerTemplateDto) {
    try {
      this.logger.debug('[CREATE TEMPLATE]: Receive request creating template');
      return this.templateService.createTemplate(templateDto);
    } catch (error) {
      throw new BadRequestException('Cant sync data from schedule');
    }
  }

  @Post('createScheduler')
  createScheduler(@Body() createSchedulerDto: CreateSchedulerDto) {
    return this.templateService.createScheduler(createSchedulerDto);
  }
}
