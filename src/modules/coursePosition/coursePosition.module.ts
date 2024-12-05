import { forwardRef, Module } from "@nestjs/common";
import { CoursePositionService } from './service/coursePosition.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePositionEntity } from './entity/coursePosition.entity';
import { ScheduleTemplateModule } from '../schedulerTemplate/scheduleTemplate.module';
import { CoursesModule } from '../courses/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoursePositionEntity]),
    forwardRef(() => ScheduleTemplateModule),
    forwardRef(() => CoursesModule),
  ],
  controllers: [],
  providers: [CoursePositionService],
  exports: [TypeOrmModule, CoursePositionService],
})
export class CoursePositionModule {}
