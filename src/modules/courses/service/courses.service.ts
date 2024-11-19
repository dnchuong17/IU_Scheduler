import { Injectable } from '@nestjs/common';
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
  async getAllCourses() {
    const response = await this.coursesRepository.find();
    const courseCodes = response.map((courses) => courses.courseCode);
    this.logger.debug(
      `[GET COURSE CODES] Course code length: ${courseCodes.length}`,
    );
    return courseCodes;
  }

  async createCourse(courseDto: CoursesDto) {
    const { courseCode, name, credits, isNew } = courseDto;
    const course = this.coursesRepository.create({
      courseCode,
      name,
      credits,
      isNew,
    });
    this.logger.debug('[CREATE COURSE] Save course to database');
    return this.coursesRepository.save(course);
  }

  async getCourses() {
    return await this.coursesRepository.find();
  }
}
