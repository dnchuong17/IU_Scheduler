import { forwardRef, Module } from "@nestjs/common";
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesEntity } from './courses.entity';
import { CoursePositionModule } from '../coursePosition/coursePosition.module';
import { CourseValueModule } from '../courseValue/courseValue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoursesEntity]),
    forwardRef(() => CoursePositionModule),
    CourseValueModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [TypeOrmModule],
})
export class CoursesModule {}
