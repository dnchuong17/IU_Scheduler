import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseValueEntity } from '../entity/courseValue.entity';
import { CourseValueDto } from '../dto/courseValue.dto';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';

@Injectable()
export class CourseValueService {
  constructor(
    @InjectRepository(CourseValueEntity)
    private readonly courseValueRepository: Repository<CourseValueEntity>,
    private readonly logger: TracingLoggerService,
  ) {
    this.logger.setContext(CourseValueService.name);
  }

  async getAllCourseValues() {
    const response = await this.courseValueRepository.find();
    const courseValues = response.map((courseValue) => ({
      lecture: courseValue.lecture,
      location: courseValue.location,
    }));
    this.logger.debug(
      `[GET COURSE VALUES] Course value length: ${courseValues.length}`,
    );
    return courseValues;
  }

  async createCourseValue(courseValueDto: CourseValueDto) {
    const newCourseValue = await this.courseValueRepository.create({
      lecture: courseValueDto.lecture,
      location: courseValueDto.location,
      courses: courseValueDto.courses,
      template: courseValueDto.template,
    });
    return await this.courseValueRepository.save(newCourseValue);
  }

  async existsCourseValue(courseValueDto: CourseValueDto): Promise<boolean> {
    const existingValue = await this.courseValueRepository.findOne({
      where: {
        lecture: courseValueDto.lecture,
        location: courseValueDto.location,
      },
    });

    return !!existingValue; // Returns true if a match is found
  }
}
