import { CourseValueController } from './courseValue.controller';
import { Module } from '@nestjs/common';
import { CourseValueService } from './courseValue.service';
import { CourseValueEntity } from "./courseValue.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([CourseValueEntity])],
  controllers: [CourseValueController],
  providers: [CourseValueService],
})
export class CourseValueModule {}
