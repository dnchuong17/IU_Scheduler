import { Controller, Post, Request } from '@nestjs/common';
import { ScheduleTemplateService } from './scheduleTemplate.service';
import { TracingLoggerService } from '../../logger/tracing-logger.service';

@Controller('scheduleTemplate')
export class SchedulerTemplateController {
  constructor(
    private readonly templateService: ScheduleTemplateService,
    private readonly logger: TracingLoggerService,
  ) {
    logger.setContext(SchedulerTemplateController.name);
  }

  @Post('create')
  createTemplate(@Request() req) {
    this.logger.debug('create template');
    const user = req.user;
    return this.templateService.createTemplate(user);
  }
}
