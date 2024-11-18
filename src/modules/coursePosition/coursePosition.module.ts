import { forwardRef, Module } from "@nestjs/common";
import { CoursePositionService } from './coursePosition.service';
import { CoursePositionController } from './coursePosition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePositionEntity } from './coursePosition.entity';
import { ScheduleTemplateModule } from '../schedulerTemplate/scheduleTemplate.module';
import { CoursesModule } from '../courses/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoursePositionEntity]),
    ScheduleTemplateModule,
    forwardRef(() => CoursesModule),
  ],
  providers: [CoursePositionService],
  controllers: [CoursePositionController],
  exports: [TypeOrmModule, CoursePositionService],
})
export class CoursePositionModule {}
