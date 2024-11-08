import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursePositionEntity } from './coursePosition.entity';
import { Repository } from 'typeorm';
import { CoursePositionDto } from './coursePosition.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CoursePositionService {
  constructor(
    @InjectRepository(CoursePositionEntity)
    private readonly coursePositionRepository: Repository<CoursePositionEntity>,
  ) {}

  async createCoursePosition(@Body() coursePositionDto: CoursePositionDto) {
    try {
      const newCoursePosition = plainToInstance(
        CoursePositionEntity,
        coursePositionDto,
      );

      await this.coursePositionRepository.save(newCoursePosition);

      return {
        message: 'Course Position Value created successfully',
        courseValue: newCoursePosition,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error creating Course Position');
    }
  }
}
