import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesDto } from '../dto/courses.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CoursesEntity } from '../entity/courses.entity';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CoursesEntity)
    private readonly coursesRepository: Repository<CoursesEntity>,
    private readonly logger: TracingLoggerService,
    private readonly dataSource: DataSource,
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
    const savedCourse = await this.coursesRepository.save(course);
    return savedCourse;
  }

  async getCourses() {
    return await this.coursesRepository.find();
  }

  async findCourseByCourseCode(coursesCode: string) {
    const course = await this.coursesRepository.findOne({
      where: { courseCode: coursesCode },
    });
    return course;
  }

  async updateCourse(courseDto: CoursesDto) {
    const course = await this.coursesRepository.findOne({
      where: { courseCode: courseDto.courseCode },
    });
    if (!course) {
      throw new NotFoundException(
        `Course with code ${courseDto.courseCode} not found`,
      );
    }
    this.logger.debug(
      `[UPDATE COURSE] update course with course code: ${courseDto.courseCode} successfully!`,
    );
    Object.assign(course, courseDto);
    return await this.coursesRepository.save(course);
  }

  async deleteCourse(courseDto: CoursesDto): Promise<void> {
    const course = await this.coursesRepository.findOne({
      where: { courseCode: courseDto.courseCode },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with code ${courseDto.courseCode} not found`,
      );
    }

    await this.coursesRepository.delete({ courseCode: courseDto.courseCode });

    this.logger.debug(
      `[DELETE COURSE] Deleted course with course code: ${courseDto.courseCode} successfully!`,
    );
  }
}
