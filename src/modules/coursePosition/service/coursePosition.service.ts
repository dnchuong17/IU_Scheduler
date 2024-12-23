import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursePositionEntity } from '../entity/coursePosition.entity';
import { EntityManager, Like, Repository } from 'typeorm';
import { CoursePositionDto } from '../dto/coursePosition.dto';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import { CoursesService } from '../../courses/service/courses.service';
import { CoursesEntity } from '../../courses/entity/courses.entity';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/entity/schedulerTemplate.entity';
import { CourseValueService } from '../../courseValue/service/courseValue.service';

@Injectable()
export class CoursePositionService {
  constructor(
    @InjectRepository(CoursePositionEntity)
    private readonly coursePositionRepository: Repository<CoursePositionEntity>,
    private readonly logger: TracingLoggerService,
  ) {
    this.logger.setContext(CoursePositionService.name);
  }
  async createCoursePos(
    coursePosDto: CoursePositionDto,
    entityManager?: EntityManager,
  ) {
    try {
      // Chọn EntityManager từ transaction nếu có
      const manager = entityManager || this.coursePositionRepository.manager;

      // Xác thực dữ liệu đầu vào
      if (
        !coursePosDto.days ||
        !coursePosDto.periods ||
        !coursePosDto.startPeriod ||
        !coursePosDto.scheduler ||
        !coursePosDto.courses
      ) {
        throw new BadRequestException(
          'Missing required fields for CoursePosition',
        );
      }

      // Tạo thực thể mới
      const newPos = manager.create(CoursePositionEntity, {
        days: coursePosDto.days,
        periods: coursePosDto.periods,
        startPeriod: coursePosDto.startPeriod,
        scheduler: coursePosDto.scheduler,
        courses: coursePosDto.courses,
      });

      const savedCoursePos = await manager.save(newPos);

      this.logger.debug(
        `[CREATE COURSE POSITION] Created successfully: ${JSON.stringify(
          savedCoursePos,
        )}`,
      );

      return savedCoursePos;
    } catch (error) {
      this.logger.error(
        `[CREATE COURSE POSITION] Failed to create CoursePosition: ${error.message}`,
      );
      throw error;
    }
  }

  async existedLabCoursePos(
    course: CoursesEntity,
    scheduler: SchedulerTemplateEntity,
  ) {
    const existingCoursePos = await this.coursePositionRepository.findOne({
      where: {
        isLab: true,
        courses: { id: course.id },
        scheduler: { id: scheduler.id },
      },
    });

    if (!existingCoursePos) {
      this.logger.debug(
        `[FIND COURSE POSITION] Course value not found with provided details`,
      );
      return null;
    }

    this.logger.debug(
      `[FIND COURSE POSITION] Found course value with ID: ${existingCoursePos.id}`,
    );

    return existingCoursePos;
  }

  async createLabCoursePos(coursePositionDto: CoursePositionDto) {
    const newLabCoursePos = await this.coursePositionRepository.create({
      days: coursePositionDto.days,
      periods: coursePositionDto.periods,
      startPeriod: coursePositionDto.startPeriod,
      scheduler: coursePositionDto.scheduler,
      isLab: true,
      courses: coursePositionDto.courses,
    });

    const savedCoursePos =
      await this.coursePositionRepository.save(newLabCoursePos);

    this.logger.debug(
      `[CREATE LAB COURSE POSITION] Created new lab course position successfully:`,
    );

    return savedCoursePos;
  }

  async updateLabCoursePos(
    coursePosDto: CoursePositionDto,
  ): Promise<CoursePositionEntity> {
    const existingCoursePosition = await this.existedLabCoursePos(
      coursePosDto.courses,
      coursePosDto.scheduler,
    );
    if (!existingCoursePosition) {
      return await this.createCoursePos(coursePosDto);
    }
    existingCoursePosition.days = coursePosDto.days;
    existingCoursePosition.periods = coursePosDto.periods;
    existingCoursePosition.startPeriod = coursePosDto.startPeriod;

    this.logger.debug(
      `[UPDATE COURSE POSITION] update course position with course position's ID: ${existingCoursePosition.id} successfully!`,
    );
    return await this.coursePositionRepository.save(existingCoursePosition);
  }

  async deleteCoursePosByCourseId(courseId: number): Promise<void> {
    const deletedCourse = await this.coursePositionRepository.findOne({
      where: { id: courseId },
    });
    if (!deletedCourse) {
      throw new NotFoundException('Course is not found');
    }
    await this.coursePositionRepository.delete({ id: courseId });
  }

  async existsCoursePosition(coursePosDto: CoursePositionDto) {
    const coursePos = await this.coursePositionRepository.findOne({
      where: {
        days: coursePosDto.days,
        periods: coursePosDto.periods,
        startPeriod: coursePosDto.startPeriod,
        scheduler: coursePosDto.scheduler,
        courses: coursePosDto.courses,
      },
    });
    return !!coursePos;
  }
  async findCoursePos(
    course: CoursesEntity,
    scheduler: SchedulerTemplateEntity,
  ) {
    const existingCoursePos = await this.coursePositionRepository.findOne({
      where: {
        courses: { id: course.id },
        scheduler: { id: scheduler.id },
      },
    });

    if (!existingCoursePos) {
      this.logger.debug(
        `[FIND COURSE POSITION] Course position not found with provided details`,
      );
      return null;
    }

    this.logger.debug(
      `[FIND COURSE POSITION] Found course position with ID: ${existingCoursePos.id}`,
    );

    return existingCoursePos;
  }
  async updateCoursePos(
    coursePosDto: CoursePositionDto,
  ): Promise<CoursePositionEntity> {
    const existingCoursePosition = await this.coursePositionRepository.findOne({
      where: {
        courses: { id: coursePosDto.courses.id },
        scheduler: { id: coursePosDto.scheduler.id },
      },
    });
    if (!existingCoursePosition) {
      return await this.createCoursePos(coursePosDto);
    }

    existingCoursePosition.days = coursePosDto.days;
    existingCoursePosition.periods = coursePosDto.periods;
    existingCoursePosition.startPeriod = coursePosDto.startPeriod;

    this.logger.debug(
      `[UPDATE COURSE POSITION] update course position with course position's ID: ${existingCoursePosition.id} successfully!`,
    );
    return await this.coursePositionRepository.save(existingCoursePosition);
  }

  async deleteCoursePos(courseId: number, schedulerId: number): Promise<void> {
    const existingCoursePosition = await this.coursePositionRepository.findOne({
      where: {
        courses: { id: courseId },
        scheduler: { id: schedulerId },
      },
    });

    if (!existingCoursePosition) {
      throw new NotFoundException(
        `Course Position with courseId ${courseId} and schedulerId ${schedulerId} not found`,
      );
    }

    await this.coursePositionRepository.delete({
      id: existingCoursePosition.id,
    });

    this.logger.debug(
      `[DELETE COURSE POSITION]Deleted course position with ID: ${existingCoursePosition.id} successfully!`,
    );
  }
}
