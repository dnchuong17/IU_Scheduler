import { Injectable } from '@nestjs/common';
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
    });
    return await this.coursePositionRepository.save(newPos);
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
