import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursePositionEntity } from '../entity/coursePosition.entity';
import { EntityManager, Repository } from 'typeorm';
import { CoursePositionDto } from '../dto/coursePosition.dto';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';

@Injectable()
export class CoursePositionService {
  constructor(
    @InjectRepository(CoursePositionEntity)
    private readonly coursePositionRepository: Repository<CoursePositionEntity>,
    private readonly logger: TracingLoggerService,
  ) {}
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
}
