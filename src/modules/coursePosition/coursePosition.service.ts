import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursePositionEntity } from './coursePosition.entity';
import { Repository } from 'typeorm';
import { CoursePositionDto } from './coursePosition.dto';
import { plainToInstance } from 'class-transformer';
import { SchedulerTemplateEntity } from '../schedulerTemplate/entity/schedulerTemplate.entity';
import { CoursesEntity } from '../courses/entity/courses.entity';

@Injectable()
export class CoursePositionService {
  constructor(
    @InjectRepository(CoursePositionEntity)
    private readonly coursePositionRepository: Repository<CoursePositionEntity>,

    @InjectRepository(SchedulerTemplateEntity)
    private readonly schedulerTemplateRepository: Repository<SchedulerTemplateEntity>,

    @InjectRepository(CoursesEntity)
    private readonly coursesRepository: Repository<CoursesEntity>,
  ) {}

  async createCoursePosition(@Body() coursePositionDto: CoursePositionDto) {
    // Create the new CoursePosition entity
    const newCoursePosition = plainToInstance(
      CoursePositionEntity,
      coursePositionDto,
    );

    try {
      await this.coursePositionRepository.save(newCoursePosition);

      return {
        message: 'Course Position created successfully',
        coursePosition: newCoursePosition,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error creating Course Position');
    }
  }
}
