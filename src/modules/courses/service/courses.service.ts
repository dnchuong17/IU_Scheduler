import { BadRequestException, Injectable } from '@nestjs/common';
import { CoursesDto } from '../dto/courses.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesEntity } from '../entity/courses.entity';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CoursesEntity)
    private readonly coursesRepository: Repository<CoursesEntity>,
    private readonly logger: TracingLoggerService,
  ) {
    this.logger.setContext(CoursesService.name);
  }

  async findCourseByCourseCode(courseCode: string) {
    return this.coursesRepository.findOne({ where: { courseCode } });
  }

  async createCourse(courseDto: CoursesDto) {
    const { courseCode, name, credits } = courseDto;

    this.logger.debug('[CREATE COURSE] Check existed course');
    const existingCourse = await this.findCourseByCourseCode(courseCode);
    if (existingCourse) {
      throw new BadRequestException(
        `Course with code ${courseCode} already exists.`,
      );
    }

    const course = this.coursesRepository.create({
      courseCode,
      name,
      credits,
    });
    this.logger.debug('[CREATE COURSE] Save course to database');
    return this.coursesRepository.save(course);
  }
}
