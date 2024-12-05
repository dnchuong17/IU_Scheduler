import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursePositionEntity } from '../entity/coursePosition.entity';
import { Repository } from 'typeorm';
import { CoursePositionDto } from '../dto/coursePosition.dto';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';

@Injectable()
export class CoursePositionService {
  constructor(
    @InjectRepository(CoursePositionEntity)
    private readonly coursePositionRepository: Repository<CoursePositionEntity>,
    private readonly logger: TracingLoggerService,
  ) {}
  async createCoursePos(coursePosDto: CoursePositionDto) {
    const newPos = await this.coursePositionRepository.create({
      days: coursePosDto.days,
      periods: coursePosDto.periods,
      startPeriod: coursePosDto.startPeriod,
      scheduler: coursePosDto.scheduler,
      courses: coursePosDto.courses,
    });
    return await this.coursePositionRepository.save(newPos);
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
      throw new NotFoundException(
        `Course Position with courseId ${coursePosDto.courses.id} and schedulerId ${coursePosDto.scheduler.id} not found`,
      );
    }

    existingCoursePosition.days = coursePosDto.days;
    existingCoursePosition.periods = coursePosDto.periods;
    existingCoursePosition.startPeriod = coursePosDto.startPeriod;

    this.logger.debug(
      `[UPDATE COURSE POSITION] update course with course position's ID: ${existingCoursePosition.id} successfully!`,
    );
    return await this.coursePositionRepository.save(existingCoursePosition);
  }

  async deleteCoursePos(coursePosDto: CoursePositionDto): Promise<void> {
    const existingCoursePosition = await this.coursePositionRepository.findOne({
      where: {
        courses: { id: coursePosDto.courses.id },
        scheduler: { id: coursePosDto.scheduler.id },
      },
    });

    if (!existingCoursePosition) {
      throw new NotFoundException(
        `Course Position with courseId ${coursePosDto.courses.id} and schedulerId ${coursePosDto.scheduler.id} not found`,
      );
    }

    await this.coursePositionRepository.delete({
      id: existingCoursePosition.id,
    });

    this.logger.debug(
      `[DELETE COURSE POSITION] Deleted course position with ID: ${existingCoursePosition.id} successfully!`,
    );
  }
}
