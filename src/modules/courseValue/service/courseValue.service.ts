import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Like, Repository } from 'typeorm';
import { CourseValueEntity } from '../entity/courseValue.entity';
import { CourseValueDto } from '../dto/courseValue.dto';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import { NoteEntity } from '../../note/entity/note.entity';
import { CoursesEntity } from '../../courses/entity/courses.entity';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/entity/schedulerTemplate.entity';
import { LAB_LOCATION_PREFIX } from '../dto/courseValue.constant';

@Injectable()
export class CourseValueService {
  constructor(
    @InjectRepository(CourseValueEntity)
    private readonly courseValueRepository: Repository<CourseValueEntity>,
    private readonly logger: TracingLoggerService,
  ) {
    this.logger.setContext(CourseValueService.name);
  }

  async getAllCourseValues() {
    const response = await this.courseValueRepository.find();
    const courseValues = response.map((courseValue) => ({
      lecture: courseValue.lecture,
      location: courseValue.location,
    }));
    this.logger.debug(
      `[GET COURSE VALUES] Course value length: ${courseValues.length}`,
    );
    return courseValues;
  }

  async getCourseValue(id: number) {
    const existingCourseValue = await this.courseValueRepository.findOne({
      where: { id },
    });
    if (!existingCourseValue) {
      this.logger.debug(
        `[COURSE VALUE] fail to find course value with id: ${id}`,
      );
      throw new NotFoundException('can not found course value');
    }
    return existingCourseValue;
  }

  async createCourseValue(
    courseValueDto: CourseValueDto,
    entityManager?: EntityManager,
  ) {
    try {
      const manager = entityManager || this.courseValueRepository.manager;

      if (
        !courseValueDto.lecture ||
        !courseValueDto.location ||
        !courseValueDto.courses ||
        !courseValueDto.scheduler
      ) {
        throw new BadRequestException(
          'Missing required fields for CourseValue',
        );
      }

      // Tạo thực thể mới
      const newCourseValue = manager.create(CourseValueEntity, {
        lecture: courseValueDto.lecture,
        location: courseValueDto.location,
        courses: courseValueDto.courses,
        scheduler: courseValueDto.scheduler,
      });
      const savedCourseValue = await manager.save(newCourseValue);

      this.logger.debug(
        `[CREATE COURSE VALUE] Created successfully: ${JSON.stringify(
          savedCourseValue,
        )}`,
      );

      return savedCourseValue;
    } catch (error) {
      this.logger.error(
        `[CREATE COURSE VALUE] Failed to create CourseValue: ${error.message}`,
      );
      throw error;
    }
  }

  async createLabCourseValue(courseValueDto: CourseValueDto) {
    const newCourseValue = await this.courseValueRepository.create({
      lecture: courseValueDto.lecture,
      location: courseValueDto.location,
      courses: courseValueDto.courses,
      scheduler: courseValueDto.scheduler,
    });
    const savedCourseValue =
      await this.courseValueRepository.save(newCourseValue);

    this.logger.debug(`[CREATE COURSE VALUE] Created successfully`);

    return savedCourseValue;
  }

  async existsCourseValue(courseValueDto: CourseValueDto) {
    const existingValue = await this.courseValueRepository.findOne({
      where: {
        courses: courseValueDto.courses,
        lecture: courseValueDto.lecture,
        location: courseValueDto.location,
        scheduler: courseValueDto.scheduler,
      },
    });
    return !!existingValue; // Returns true if a match is found
  }

  async existedLabCourseValue(
    course: CoursesEntity,
    scheduler: SchedulerTemplateEntity,
  ) {
    const existingCourseValue = await this.courseValueRepository.findOne({
      where: {
        location: Like(LAB_LOCATION_PREFIX),
        courses: { id: course.id },
        scheduler: { id: scheduler.id },
      },
    });

    if (!existingCourseValue) {
      this.logger.debug(
        `[FIND LAB COURSE VALUE] Course value not found with provided details`,
      );
      return null;
    }

    this.logger.debug(
      `[FIND LAB COURSE VALUE] Found course value with ID: ${existingCourseValue.id}`,
    );

    return existingCourseValue;
  }

  async updateCourseValue(courseValueDto: CourseValueDto) {
    const existingCourseValue = await this.courseValueRepository.findOne({
      where: {
        courses: courseValueDto.courses,
        scheduler: courseValueDto.scheduler,
      },
    });
    if (!existingCourseValue) {
      return await this.createCourseValue(courseValueDto);
    }

    existingCourseValue.lecture = courseValueDto.lecture;
    existingCourseValue.location = courseValueDto.location;

    this.logger.debug(
      `[UPDATE COURSE VALUE] update course value with course value's ID: ${existingCourseValue.id} successfully!`,
    );
    return await this.courseValueRepository.save(existingCourseValue);
  }

  async updateLabCourseValue(courseValueDto: CourseValueDto) {
    const existingCourseValue = await this.courseValueRepository.findOne({
      where: {
        location: Like('LA%'),
        courses: { id: courseValueDto.courses.id },
        scheduler: { id: courseValueDto.scheduler.id },
      },
    });
    if (!existingCourseValue) {
      return await this.createCourseValue(courseValueDto);
    }

    existingCourseValue.lecture = courseValueDto.lecture;
    existingCourseValue.location = courseValueDto.location;

    this.logger.debug(
      `[UPDATE COURSE VALUE] update course value with course value's ID: ${existingCourseValue.id} successfully!`,
    );
    return await this.courseValueRepository.save(existingCourseValue);
  }

  async deleteCourseValue(
    courseId: number,
    schedulerId: number,
  ): Promise<void> {
    const existingCourseValue = await this.courseValueRepository.findOne({
      where: {
        courses: { id: courseId },
        scheduler: { id: schedulerId },
      },
      relations: ['note'],
    });

    if (!existingCourseValue) {
      throw new NotFoundException('Course value not found');
    }

    // Delete note entity
    if (existingCourseValue.note) {
      await this.courseValueRepository.manager.delete(
        NoteEntity,
        existingCourseValue.note.id,
      );
      this.logger.debug(
        `[DELETE NOTE]Deleted note with ID: ${existingCourseValue.note.id} successfully!`,
      );
    }

    await this.courseValueRepository.delete({ id: existingCourseValue.id });

    this.logger.debug(
      `[DELETE COURSE VALUE]Deleted course value with ID: ${existingCourseValue.id} successfully!`,
    );
  }
}
