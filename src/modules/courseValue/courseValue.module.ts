import { CourseValueController } from './controller/courseValue.controller';
import { Module } from '@nestjs/common';
import { CourseValueService } from './service/courseValue.service';
import { CourseValueEntity } from './entity/courseValue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesEntity } from '../courses/entity/courses.entity';


@Module({
  imports: [TypeOrmModule.forFeature([CourseValueEntity, CoursesEntity])],
  controllers: [CourseValueController],
  providers: [CourseValueService],
  exports: [TypeOrmModule],
})
export class CourseValueModule {}
