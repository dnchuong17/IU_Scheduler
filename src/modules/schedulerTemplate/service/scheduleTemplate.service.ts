import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from '../entity/schedulerTemplate.entity';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import { plainToInstance } from 'class-transformer';
import { SchedulerTemplateDto } from '../dto/schedulerTemplate.dto';
import { CreateSchedulerDto } from '../dto/createScheduler.dto';
import { UserService } from '../../user/service/user.service';
import { CreateTemplateItemDto } from '../dto/createTemplateItem.dto';
import { CoursePositionService } from '../../coursePosition/service/coursePosition.service';
import { CourseValueService } from '../../courseValue/service/courseValue.service';
import { CoursesService } from '../../courses/service/courses.service';
@Injectable()
export class ScheduleTemplateService {
  constructor(
    @InjectRepository(SchedulerTemplateEntity)
    private readonly schedulerTemplateRepo: Repository<SchedulerTemplateEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly datasource: DataSource,
    private readonly logger: TracingLoggerService,
    private readonly userService: UserService,
    private readonly coursePositonService: CoursePositionService,
    private readonly courseValueService: CourseValueService,
    private readonly coursesService: CoursesService,
  ) {}

  async findTemplateWithId(id: number): Promise<boolean> {
    try {
      const query = `
      SELECT *
      FROM scheduler_template
      WHERE scheduler_template.scheduler_id = $1
    `;
      const template = await this.datasource.query(query, [id]);
      return template.length > 0;
    } catch (error) {
      this.logger.error(
        `Error fetching template with ID ${id}: ${error.message}`,
      );
      throw new BadRequestException('Could not fetch template');
    }
  }

  async findTemplateForCreateScheduler(studentId: string, templateId: number) {
    // Find student by Student ID, if null => throw error
    const user = await this.userService.findUserWithUID(studentId);
    if (!user) {
      this.logger.error(`[ERROR] User with ID ${studentId} not found!`);
      throw new BadRequestException('user not found');
    }
    // If templateID is null => create new Template
    if (!templateId) {
      const templateDto = plainToInstance(SchedulerTemplateDto, {
        user: user,
      });
      return await this.createTemplate(templateDto);
    }
  }

  async createScheduler(createSchedulerDto: CreateSchedulerDto) {
    // Check null
    const { studentId, templateId, listOfCourses } = createSchedulerDto;
    // If studentID is null => error
    if (!studentId) {
      this.logger.error(`[ERROR] Student with ID ${studentId} not found!`);
      throw new BadRequestException('studentId is required');
    }
    // If we can not find template by template id => throw error
    const newTemplate = await this.findTemplateForCreateScheduler(
      studentId,
      templateId,
    );
    if (!newTemplate) {
      this.logger.error(`[ERROR] template with ID ${templateId} not found!`);
      throw new BadRequestException('template not found');
    }
    // Create new template
    for (const course of listOfCourses) {
      const {
        courseID,
        courseName,
        date,
        startPeriod,
        periodsCount,
        credits,
        location,
        lecturer,
        isActive,
        isDeleted,
      } = course;
      // If courseID = null (no equivalent course in database) => create new course, new coursePosition
      if (!courseID) {
        const courses = await this.coursesService.createCourse({
          credits: credits,
          courseCode: courseID,
          name: courseName,
        });
        await this.coursePositonService.createCoursePos({
          days: date,
          periods: periodsCount,
          startPeriod: startPeriod,
          scheduler: newTemplate,
          courses: courses,
        });
      }
      // Update template
    }
  }

  async createTemplate(templateDto: SchedulerTemplateDto) {
    this.logger.debug('create template');
    const newTemplate = this.schedulerTemplateRepo.create({
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
}
