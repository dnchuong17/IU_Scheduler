import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from '../entity/schedulerTemplate.entity';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
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

  async findTemplateWithUID(userId: number): Promise<boolean> {
    const query = `
      SELECT student_users.*
      FROM scheduler_template
      LEFT JOIN student_users ON scheduler_template.scheduler_id = student_users.schedule_template_id
      WHERE student_users.id = $1
    `;
    const template = await this.datasource.query(query, [userId]);
    return template.length > 0;
  }

  async createTemplate(userId: number) {
    const query = 'SELECT * FROM student_users WHERE id = $1';
    const user = await this.datasource.query(query, [userId]);
    if (user.length === 0) {
      throw new BadRequestException(`Not found user with ID ${userId}`);
    }

    const existedTemplate = await this.findTemplateWithUID(userId);
    if (existedTemplate) {
      throw new BadRequestException(
        `User with ID ${userId} already has a template`,
      );
    }
    const newTemplate = this.schedulerTemplateRepo.create();
    await this.schedulerTemplateRepo.save(newTemplate);

    user.scheduleTemplate = newTemplate;
    await this.userRepo.save(user);

    return newTemplate;
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
}
