import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeadlineEntity } from './entity/deadline.entity';
import { DeadlineService } from './service/deadline.service';
import { DeadlineController } from './controller/deadline.controller';
import { CourseValueService } from '../courseValue/service/courseValue.service';
import { CourseValueEntity } from '../courseValue/entity/courseValue.entity';
import { TracingLoggerService } from "../../logger/tracing-logger.service";

@Module({
  imports: [TypeOrmModule.forFeature([DeadlineEntity, CourseValueEntity])],
  controllers: [DeadlineController],
  providers: [DeadlineService, CourseValueService, TracingLoggerService],
})
export class DeadlineModule {}
