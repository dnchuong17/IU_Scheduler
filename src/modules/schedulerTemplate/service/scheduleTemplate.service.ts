import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from '../entity/schedulerTemplate.entity';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import { plainToInstance } from 'class-transformer';
import { UserService } from '../../user/service/user.service';
import { CoursePositionService } from '../../coursePosition/service/coursePosition.service';
import { CourseValueService } from '../../courseValue/service/courseValue.service';
import { CoursesService } from '../../courses/service/courses.service';
import { SchedulerTemplateDto } from '../dto/scheduler-Template.dto';
import { CreateTemplateItemDto } from '../dto/createTemplateItem.dto';
import { CoursesEntity } from '../../courses/entity/courses.entity';
import { NoteService } from '../../note/service/note.service';
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
    private readonly noteService: NoteService,
  ) {}

  async findTemplateWithId(id: number) {
    const template = await this.schedulerTemplateRepo.findOne({
      where: { id: id },
    });
    return template;
  }

  async createSchedule(schedulerTemplateDto: SchedulerTemplateDto) {
    // Find student by student ID
    const existedStudent = await this.userService.findUserWithUID(
      schedulerTemplateDto.studentId,
    );

    // If the template ID is null, create a new template
    if (schedulerTemplateDto.templateId === null) {
      const templateDto = plainToInstance(SchedulerTemplateDto, {
        user: existedStudent,
      });
      await this.createTemplate(templateDto);
    } else {
      const existedTemplate = await this.findTemplateWithId(
        schedulerTemplateDto.templateId,
      );
      if (existedTemplate !== null) {
        let existedCourse: CoursesEntity | null = null;

        // Loop through each course in the list
        for (const course of schedulerTemplateDto.listOfCourses) {
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

          // Check if the course exists in the database
          existedCourse =
            await this.coursesService.findCourseByCourseCode(courseID);

          // If the course doesn't exist, create a new course
          if (!existedCourse) {
            const newCourse = await this.coursesService.createCourse({
              courseCode: courseID,
              name: courseName,
              credits: credits,
              isNew: true,
            });

            // Create new course position
            const newCoursePosition =
              await this.coursePositonService.createCoursePos({
                days: date,
                periods: periodsCount,
                startPeriod: startPeriod,
                scheduler: existedTemplate,
                courses: newCourse,
              });

            // Create new course value
            const newCourseValue =
              await this.courseValueService.createCourseValue({
                lecture: lecturer,
                location: location,
                courses: newCourse,
                scheduler: existedTemplate,
              });
          } else {
            // If the course already exists, check the isDeleted flag
            if (isDeleted) {
              // If isDeleted is true, delete the course
              await this.deleteCourse(
                schedulerTemplateDto,
                existedCourse,
                existedTemplate,
              );
            } else {
              // Otherwise, update the existing course
              await this.coursesService.updateCourse({
                courseCode: courseID,
                name: courseName,
                credits: credits,
                isNew: true,
              });

              // Update course position
              await this.coursePositonService.updateCoursePos({
                days: date,
                periods: periodsCount,
                startPeriod: startPeriod,
                courses: existedCourse,
                scheduler: existedTemplate,
              });

              // Update course value
              await this.courseValueService.updateCourseValue({
                lecture: lecturer,
                location: location,
                courses: existedCourse,
                scheduler: existedTemplate,
              });
            }
          }
        }
      }
    }
  }

  async deleteAllCourse(
    schedulerTemplateDto: SchedulerTemplateDto,
    existedCourse: CoursesEntity,
    existedTemplate: SchedulerTemplateEntity,
  ) {
    // Delegate logic to deleteCourse as deleteAllCourse is effectively a wrapper
    await this.deleteCourse(
      schedulerTemplateDto,
      existedCourse,
      existedTemplate,
    );
  }

  async deleteCourse(
    schedulerTemplateDto: SchedulerTemplateDto,
    existedCourse: CoursesEntity,
    existedTemplate: SchedulerTemplateEntity,
  ) {
    const coursesToDelete = schedulerTemplateDto.listOfCourses.filter(
      (course) => course.isDeleted === true,
    );

    for (let i = 0; i < coursesToDelete.length; i++) {
      const course = coursesToDelete[i];

      const {
        lecturer,
        location,
        courseID,
        courseName,
        credits,
        date,
        periodsCount,
        startPeriod,
      } = course;
      if (course.isDeleted === true) {
        // Delete related course positions first
        await this.coursePositonService.deleteCoursePos({
          days: date,
          periods: periodsCount,
          startPeriod: startPeriod,
          courses: existedCourse,
          scheduler: existedTemplate,
        });

        // Delete related course values next
        await this.courseValueService.deleteCourseValue({
          lecture: lecturer,
          location: location,
          courses: existedCourse,
          scheduler: existedTemplate,
        });

        // Finally, delete the course
        await this.coursesService.deleteCourse({
          courseCode: courseID,
          name: courseName,
          credits: credits,
          isNew: true,
        });

        this.logger.debug(
          `[DELETE COURSE] Successfully deleted course ${courseID} - ${courseName}`,
        );
      }
    }
  }

  async createTemplate(templateDto: SchedulerTemplateDto) {
    this.logger.debug('[CREATE TEMPLATE] create template');
    const newTemplate = this.schedulerTemplateRepo.create({
      isSync: templateDto.isSynced,
      isMain: templateDto.isMainTemplate,
      lastSyncTime: templateDto.lastSyncTime,
      user: templateDto.user,
    });
    this.logger.debug('[CREATE TEMPLATE] save template successfully');
    return await this.schedulerTemplateRepo.save(newTemplate);
  }

  async getTemplate(id: number) {
    this.logger.debug('[SCHEDULE TEMPLATE] Get one template information by id');

    const query = `
      SELECT 
        st.issynced, 
        st.is_main_template, 
        st.lastsynctime,
        cp.course_position_id,
        cp.days_in_week,
        cp.start_period,
        cp.periods,
        c.course_id,
        c.course_name,
        c.credits,
        c.course_code,
        cv.course_value_id,
        cv.lecture,
        cv.location
      FROM scheduler_template st
      LEFT JOIN course_position cp ON st.scheduler_id = cp."schedulerId"
      LEFT JOIN courses c ON cp."coursesId" = c.course_id
      LEFT JOIN course_value cv ON cv."coursesId" = c.course_id
      WHERE st.scheduler_id = $1;
    `;
    const schedule = await this.datasource.query(query, [id]);
    return schedule;
  }

  async getAllTemplateBySID(sid: string) {
    this.logger.debug(
      '[SCHEDULE TEMPLATE] Get all template information of one student by student id',
    );
    const existedStudent = await this.userService.findUserWithUID(sid);
    if (!existedStudent) {
      throw new BadRequestException(`user with id: ${sid} not found`);
    }

    const query = `
      SELECT 
        st.issynced, 
        st.is_main_template, 
        st.lastsynctime,
        cp.course_position_id,
        cp.days_in_week,
        cp.start_period,
        cp.periods,
        c.course_id,
        c.course_name,
        c.credits,
        c.course_code,
        cv.course_value_id,
        cv.lecture,
        cv.location
      FROM scheduler_template st
      LEFT JOIN course_position cp ON st.scheduler_id = cp."schedulerId"
      LEFT JOIN courses c ON cp."coursesId" = c.course_id
      LEFT JOIN course_value cv ON cv."coursesId" = c.course_id
      WHERE st."userId" = $1;
    `;
    const schedule = await this.datasource.query(query, [existedStudent.id]);
    return schedule;
  }
  async getTemplateBySID(sid: string) {
    return await this.datasource
      .getRepository(SchedulerTemplateEntity)
      .createQueryBuilder('scheduler_template')
      .leftJoinAndSelect('scheduler_template.user', 'user') // join bảng 'student_users'
      .where('scheduler_template.is_main_template = true')
      .andWhere('user.studentID = :sid', { sid })
      .getOne();
  }
}
