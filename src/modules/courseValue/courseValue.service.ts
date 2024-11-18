import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseValueEntity } from './courseValue.entity';
import { CourseValueDto } from './courseValue.dto';
import { plainToInstance } from 'class-transformer';
import { CoursesEntity } from '../courses/courses.entity';
@Injectable()
export class CourseValueService {
  constructor(
    @InjectRepository(CourseValueEntity)
    private readonly courseValueRepository: Repository<CourseValueEntity>,

    @InjectRepository(CoursesEntity)
    private readonly coursesRepository: Repository<CoursesEntity>,
  ) {}

  // async createCourseValue(courseValueDto: CourseValueDto) {
  //   // If the courseValue already exists
  //   const existingCourseValue = await this.courseValueRepository.findOne({
  //     where: { courses: { id: courseValueDto.courseId } },
  //   });
  //
  //   if (existingCourseValue) {
  //     throw new BadRequestException(
  //       'Course value already exists for this course',
  //     );
  //   }
  //
  //   // Check if the course exists
  //   const course = await this.coursesRepository.findOne({
  //     where: { id: courseValueDto.courseId },
  //   });
  //
  //   if (!course) {
  //     throw new NotFoundException('Course not found'); // Throw error if the course doesn't exist
  //   }
  //
  //   const newCourseValue = plainToInstance(CourseValueEntity, courseValueDto);
  //   newCourseValue.courses = course;
  //
  //   // Save the new course value to the database
  //
  //   try {
  //     const newCourseValue = plainToInstance(CourseValueEntity, courseValueDto);
  //     await this.courseValueRepository.save(newCourseValue);
  //     return {
  //       message: 'New course value created successfully',
  //       courseValue: newCourseValue,
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     if (error instanceof Error) {
  //       throw new BadRequestException(
  //         `Error creating new course value: ${error.message}`,
  //       );
  //     }
  //     throw new BadRequestException('Error creating new course value');
  //   }
  // }
}
