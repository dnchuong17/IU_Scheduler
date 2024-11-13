import { CourseValueController } from './courseValue.controller';
import { Module } from '@nestjs/common';
import { CourseValueService } from './courseValue.service';
import { CourseValueEntity } from './courseValue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesEntity } from '../courses/courses.entity';


@Module({
  imports: [TypeOrmModule.forFeature([CourseValueEntity, CoursesEntity])],
  controllers: [CourseValueController],
  providers: [CourseValueService],
  exports: [TypeOrmModule],
})
export class CourseValueModule {}
