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

    // The reponse template ID is null
    if (schedulerTemplateDto.templateId === null) {
      const templateDto = plainToInstance(SchedulerTemplateDto, {
        user: existedStudent,
      });
      await this.createTemplate(templateDto);
    }

    // The reponse template ID is not null
    else {
      const existedTemplate = await this.findTemplateWithId(
        schedulerTemplateDto.templateId,
      );
      if (existedTemplate !== null) {
        let existedCourse: CoursesEntity | null = null;

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
            note,
            isActive,
            isDeleted,
          } = course;
          // If we can not find any course in database with the reponse courseID => create new course => new coursePosition => new course Value
          existedCourse =
            await this.coursesService.findCourseByCourseCode(courseID);

          if (!existedCourse) {
            const courses = await this.coursesService.createCourse({
              courseCode: courseID,
              name: courseName,
              credits: credits,
              isNew: true,
            });
            const newCoursePosition =
              await this.coursePositonService.createCoursePos({
                days: date,
                periods: periodsCount,
                startPeriod: startPeriod,
                scheduler: existedTemplate,
                courses: courses,
              });
            const newCourseValue =
              await this.courseValueService.createCourseValue({
                lecture: lecturer,
                location: location,
                courses: courses,
                scheduler: existedTemplate,
              });
            const newDefaultNote = await this.noteService.createNote({
              content: note,
              courseValue: newCourseValue,
            });
          }
          // If we can find one course in database with the reponse courseID => update course position
          else {
            const allCoursesDeleted = schedulerTemplateDto.listOfCourses.every(
              (course) => course.isDeleted,
            );
            // If all isDeleted variables inside the listOfCourse array is true => delete all course
            if (allCoursesDeleted) {
              await this.deleteAllCourse(
                schedulerTemplateDto,
                existedCourse,
                existedTemplate,
              );
            } else {
              await this.deleteCourse(
                schedulerTemplateDto,
                existedCourse,
                existedTemplate,
              );
            }
            // update course
            await this.coursesService.updateCourse({
              courseCode: courseID,
              name: courseName,
              credits: credits,
              isNew: true,
            });
            // update course position
            await this.coursePositonService.updateCoursePos({
              days: date,
              periods: periodsCount,
              startPeriod: startPeriod,
              courses: existedCourse,
              scheduler: existedTemplate,
            });
            // update course value
            await this.courseValueService.updateCourseValue({
              lecture: lecturer,
              location: location,
              courses: existedCourse,
              scheduler: existedTemplate,
            });
            // update note
            const foundCourseValue =
              await this.courseValueService.findCourseValue({
                courses: existedCourse,
                scheduler: existedTemplate,
                lecture: lecturer,
                location: location,
              });
            await this.noteService.updateNote(foundCourseValue.id, {
              content: note,
              courseValue: foundCourseValue,
            });
          }
        }
      }
    }
  }

  // Delete all course
  async deleteAllCourse(
    schedulerTemplateDto: SchedulerTemplateDto,
    existedCourse: CoursesEntity,
    existedTemplate: SchedulerTemplateEntity,
  ) {
    for (const course of schedulerTemplateDto.listOfCourses) {
      await this.courseValueService.deleteCourseValue({
        lecture: course.lecturer,
        location: course.location,
        courses: existedCourse,
        scheduler: existedTemplate,
      });
      await this.coursePositonService.deleteCoursePos({
        days: course.date,
        periods: course.periodsCount,
        startPeriod: course.startPeriod,
        courses: existedCourse,
        scheduler: existedTemplate,
      });
      await this.coursesService.deleteCourse({
        courseCode: course.courseID,
        name: course.courseName,
        credits: course.credits,
        isNew: true,
      });
    }
  }

  async deleteCourse(
    schedulerTemplateDto: SchedulerTemplateDto,
    existedCourse: CoursesEntity,
    existedTemplate: SchedulerTemplateEntity,
  ) {
    for (const course of schedulerTemplateDto.listOfCourses) {
      if (course.isDeleted) {
        await this.courseValueService.deleteCourseValue({
          lecture: course.lecturer,
          location: course.location,
          courses: existedCourse,
          scheduler: existedTemplate,
        });
        await this.coursePositonService.deleteCoursePos({
          days: course.date,
          periods: course.periodsCount,
          startPeriod: course.startPeriod,
          courses: existedCourse,
          scheduler: existedTemplate,
        });
        await this.coursesService.deleteCourse({
          courseCode: course.courseID,
          name: course.courseName,
          credits: course.credits,
          isNew: true,
        });
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
      .getOne(); // chỉ lấy 1 kết quả duy nhất (nếu có)
  }
}
