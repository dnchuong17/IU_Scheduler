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
import { ScheduleTemplateModule } from '../scheduleTemplate.module';
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
    private readonly courseValueService: CourseValueService,
    private readonly coursePositonService: CoursePositionService,
    private readonly coursesService: CoursesService,
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

  async createScheduler(templateDto: SchedulerTemplateDto) {
    // Check null
    if (templateDto.templateId === null) {
      // create new template
    }
    const existedTemplate = await this.findTemplateWithId(
      templateDto.templateId,
    );
    if (existedTemplate) {
      // update
    }

    // New funcion delete if Isdeleted === true
    // New function delete all: isDeleted of all course value === true => recall above function

    // // Create new template
    // for (const course of createSchedulerDto.listOfCourses) {
    //   const {
    //     courseID,
    //     courseName,
    //     date,
    //     startPeriod,
    //     periodsCount,
    //     credits,
    //     location,
    //     lecturer,
    //     isActive,
    //     isDeleted,
    //   } = course;
    //   // If courseID = null (no equivalent course in database) => create new course, new coursePosition
    //   if (!courseID) {
    //     const courses = await this.coursesService.createCourse({
    //       credits: credits,
    //       courseCode: courseID,
    //       name: courseName,
    //     });
    //     await this.coursePositonService.createCoursePos({
    //       days: date,
    //       periods: periodsCount,
    //       startPeriod: startPeriod,
    //       scheduler: foundTemplate,
    //       courses: courses,
    //     });
    //     // If isDeleted = true => delete course by course code from coursePosition
    //     if (isDeleted == true) {
    //       const deletedCourse =
    //         await this.coursesService.findCourseByCourseCode(courseID);
    //       if (!deletedCourse) {
    //         this.logger.error(
    //           `[ERROR] Course with courseCode ${courseID} not found!`,
    //         );
    //         throw new BadRequestException('Course not found');
    //       }
    //       await this.coursePositonService.deleteCoursePosByCourseId(
    //         deletedCourse.id,
    //       );
    //     }
    //     // If CourseID != null and found successfully => delete coursePosition and add new coursePosition for that course
    //     const foundCourse =
    //       await this.coursesService.findCourseByCourseCode(courseID);
    //     if (foundCourse) {
    //       await this.coursePositonService.deleteCoursePosByCourseId(
    //         foundCourse.id,
    //       );
    //       await this.coursePositonService.createCoursePos({
    //         days: date,
    //         periods: periodsCount,
    //         startPeriod: startPeriod,
    //         scheduler: foundTemplate,
    //         courses: courses,
    //       });
    //     }
    //   }
    // }
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
