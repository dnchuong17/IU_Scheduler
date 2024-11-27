import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from '../entity/schedulerTemplate.entity';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import { SchedulerTemplateDto } from '../dto/scheduler-Template.dto';
@Injectable()
export class ScheduleTemplateService {
  constructor(
    @InjectRepository(SchedulerTemplateEntity)
    private readonly schedulerTemplateRepo: Repository<SchedulerTemplateEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly datasource: DataSource,
    private readonly logger: TracingLoggerService,
  ) {}

  async findTemplateWithId(id: number): Promise<boolean> {
    const query = `
      SELECT *
      FROM scheduler_template
      WHERE scheduler_template.scheduler_id = $1
    `;
    const template = await this.datasource.query(query, [id]);
    return template.length > 0;
  }

  async createTemplate(templateDto: SchedulerTemplateDto) {
    this.logger.debug('create template');
    const newTemplate = await this.schedulerTemplateRepo.create({
      isSync: templateDto.isSynced,
      isMain: templateDto.isMainTemplate,
      lastSyncTime: templateDto.lastSyncTime,
      user: templateDto.user,
    });
    this.logger.debug('save template');
    return await this.schedulerTemplateRepo.save(newTemplate);
  }

  async getTemplate(id: number) {
    this.logger.debug('[SCHEDULE TEMPLATE] Get template`s information');
    const query =
      'SELECT scheduler_template.*, course_position.* , courses.*, course_value.* FROM scheduler_template' +
      ' LEFT JOIN course_position ON scheduler_template.scheduler_id = course_position."schedulerId"' +
      ' LEFT JOIN courses ON courses."coursePositionId" = course_position.course_position_id' +
      ' LEFT JOIN course_value ON course_value."coursesId" = courses.course_id WHERE scheduler_template.scheduler_id =' +
      ' $1';

    const schedule = this.datasource.query(query, [id]);
    return schedule;
  }

  async getTemplateBySID(id: string) {
    const query =
      'SELECT * FROM scheduler_template LEFT JOIN student_users ON scheduler_template.userId=student_user.id WHERE is_main_template=true AND student_id = $1';
    const template = this.datasource.query(query, [id]);
    return template[0];
  }
}
