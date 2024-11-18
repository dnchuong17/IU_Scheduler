import { Controller, Get, Param, Post } from '@nestjs/common';
import { ScheduleTemplateService } from '../service/scheduleTemplate.service';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';

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

  @Post('create/:id')
  createTemplate(@Param('id') userId: number) {
    this.logger.debug('create template');
    return this.templateService.createTemplate(userId);
  }
}