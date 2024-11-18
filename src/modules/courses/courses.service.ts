import { BadRequestException, Injectable } from '@nestjs/common';
import { CoursesDto } from './courses.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesEntity } from './courses.entity';
import { plainToInstance } from 'class-transformer';
import { CoursePositionEntity } from '../coursePosition/coursePosition.entity';
import { CourseValueEntity } from '../courseValue/courseValue.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CoursesEntity)
    private readonly coursesRepository: Repository<CoursesEntity>,

    @InjectRepository(CoursePositionEntity)
    private readonly coursePositionRepository: Repository<CoursePositionEntity>,

    @InjectRepository(CourseValueEntity)
    private readonly courseValueRepository: Repository<CourseValueEntity>,
  ) {}

  // async createCourse(courseDto: CoursesDto) {
  //   // Find CoursePositionEntity instance by coursePositionId
  //   let coursePosition = null;
  //   if (courseDto.coursePositionId) {
  //     coursePosition = await this.coursePositionRepository.findOne({
  //       where: { id: courseDto.coursePositionId },
  //     });
  //
  //     if (!coursePosition) {
  //       throw new BadRequestException('Invalid Course Position ID');
  //     }
  //   } else {
  //     throw new BadRequestException('Course Position is required');
  //   }
  //
  //   const newCourse = plainToInstance(CoursesEntity, courseDto);
  //   newCourse.coursePosition = coursePosition;
  //
  //   try {
  //     const savedCourse = await this.coursesRepository.save(newCourse);
  //
  //     const newCourseValue = plainToInstance(CourseValueEntity, {
  //       courses: savedCourse,
  //     });
  //
  //     await this.courseValueRepository.save(newCourseValue);
  //
  //
  //     await this.courseValueRepository.save(newCourseValue);
  //
  //     return {
  //       message: 'New course and course value created successfully',
  //       course: savedCourse,
  //       courseValue: newCourseValue,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     throw new BadRequestException(
  //       'Error creating new Course or Course Value',
  //     );
  //   }
  // }
}
