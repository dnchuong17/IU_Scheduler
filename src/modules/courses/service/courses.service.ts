import { Injectable } from '@nestjs/common';
import { CoursesDto } from '../dto/courses.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesEntity } from '../entity/courses.entity';
import { CoursePositionEntity } from '../../coursePosition/entity/coursePosition.entity';
import { CourseValueEntity } from '../../courseValue/entity/courseValue.entity';

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

  async createCourse(courseDto: CoursesDto) {}
}
