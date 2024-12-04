import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursePositionEntity } from '../entity/coursePosition.entity';
import { Repository } from 'typeorm';
import { CoursePositionDto } from '../dto/coursePosition.dto';

@Injectable()
export class CoursePositionService {
  constructor(
    @InjectRepository(CoursePositionEntity)
    private readonly coursePositionRepository: Repository<CoursePositionEntity>,
  ) {}
  async createCoursePos(coursePosDto: CoursePositionDto) {
    const newPos = await this.coursePositionRepository.create({
      days: coursePosDto.days,
      periods: coursePosDto.periods,
      startPeriod: coursePosDto.startPeriod,
      scheduler: coursePosDto.scheduler,
      courses: coursePosDto.courses,
    });
    return await this.coursePositionRepository.insert(newPos);
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
