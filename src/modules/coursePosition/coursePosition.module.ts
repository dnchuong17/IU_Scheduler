import { Module } from '@nestjs/common';
import { CoursePositionService } from './coursePosition.service';
import { CoursePositionController } from './coursePosition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePositionEntity } from './coursePosition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoursePositionEntity])],
  providers: [CoursePositionService],
  controllers: [CoursePositionController],
})
export class CoursePositionModule {}
