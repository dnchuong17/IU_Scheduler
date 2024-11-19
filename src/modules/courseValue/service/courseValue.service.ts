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
      startPeriod: courseValue.startPeriod,
      lecture: courseValue.lecture,
      date: courseValue.dayOfWeek,
      group: courseValue.group,
      labGroup: courseValue.labGroup,
      numberOfPeriods: courseValue.numberOfPeriods,
      location: courseValue.location,
    }));
    this.logger.debug(
      `[GET COURSE VALUES] Course value length: ${courseValues.length}`,
    );
    return courseValues;
  }

  async createCourseValue(courseValueDto: CourseValueDto) {
    const newCourseValue = await this.courseValueRepository.create({
      startPeriod: courseValueDto.startPeriod,
      lecture: courseValueDto.lecture,
      location: courseValueDto.location,
      dayOfWeek: courseValueDto.dayOfWeek,
      group: courseValueDto.group,
      labGroup: courseValueDto.labGroup,
      numberOfPeriods: courseValueDto.numberOfPeriods,
      courses: courseValueDto.courses,
    });
    return await this.courseValueRepository.save(newCourseValue);
  }

  async existsCourseValue(courseValueDto: CourseValueDto): Promise<boolean> {
    const existingValue = await this.courseValueRepository.findOne({
      where: {
        startPeriod: courseValueDto.startPeriod,
        lecture: courseValueDto.lecture,
        location: courseValueDto.location,
        dayOfWeek: courseValueDto.dayOfWeek,
        group: courseValueDto.group,
        labGroup: courseValueDto.labGroup,
        numberOfPeriods: courseValueDto.numberOfPeriods,
      },
    });

    return !!existingValue; // Returns true if a match is found
  }
}
