import { CourseValueController } from './courseValue.controller';
import { Module } from '@nestjs/common';
import { CourseValueService } from './courseValue.service';
import { CourseValueEntity } from './courseValue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { CoursesEntity } from '../courses/courses.entity';
=======
>>>>>>> 7d26ca9e576e2a915d481261d4a4baf3f31842cf

@Module({
  imports: [TypeOrmModule.forFeature([CourseValueEntity, CoursesEntity])],
  controllers: [CourseValueController],
  providers: [CourseValueService],
  exports: [TypeOrmModule],
})
export class CourseValueModule {}
