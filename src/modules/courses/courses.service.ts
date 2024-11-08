import { BadRequestException, Injectable } from '@nestjs/common';
import { CoursesDto } from './courses.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesEntity } from './courses.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CoursesEntity)
    private readonly coursesRepository: Repository<CoursesEntity>,
  ) {}

  async createCourse(courseDto: CoursesDto) {
    try {
      const newCourse = plainToInstance(CoursesEntity, courseDto);

      await this.coursesRepository.save(newCourse);

      return {
        message: 'Course Value created successfully',
        courseValue: newCourse,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error creating Course Value');
    }
  }
}
