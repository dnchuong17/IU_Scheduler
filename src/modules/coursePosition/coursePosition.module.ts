import { forwardRef, Module } from "@nestjs/common";
import { CoursePositionService } from './service/coursePosition.service';
import { CoursePositionController } from './controller/coursePosition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePositionEntity } from './entity/coursePosition.entity';
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
