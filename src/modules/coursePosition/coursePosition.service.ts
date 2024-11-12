import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursePositionEntity } from './coursePosition.entity';
import { Repository } from 'typeorm';
import { CoursePositionDto } from './coursePosition.dto';
import { plainToInstance } from 'class-transformer';
import { SchedulerTemplateEntity } from '../schedulerTemplate/schedulerTemplate.entity';
import { CoursesEntity } from '../courses/courses.entity';

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
    // find the shedulerTemplate instance based on the schedulerId
    const scheduler = await this.schedulerTemplateRepository.findOneBy({
      id: coursePositionDto.schedulerId,
    });
    if (!scheduler) {
      throw new BadRequestException('Invalid scheduler ID');
    }

    // Create the new CoursePosition entity
    const newCoursePosition = plainToInstance(
      CoursePositionEntity,
      coursePositionDto,
    );

    // Assign the found scheduler (schedulerTemplate instance) to the new course position
    newCoursePosition.scheduler = scheduler;

    // If courseIds are provided, find corresponding courses and assign them
    if (coursePositionDto.courseIds && coursePositionDto.courseIds.length > 0) {
      const courses = await this.coursesRepository.findByIds(
        coursePositionDto.courseIds,
      );
      newCoursePosition.courses = courses;
    }

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
