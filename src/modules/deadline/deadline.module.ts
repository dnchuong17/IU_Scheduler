import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeadlineEntity } from './entity/deadline.entity';
import { DeadlineService } from './service/deadline.service';
import { DeadlineController } from './controller/deadline.controller';
import { CourseValueService } from '../courseValue/service/courseValue.service';
import { CourseValueEntity } from '../courseValue/entity/courseValue.entity';
import { TracingLoggerService } from '../../logger/tracing-logger.service';
import { UserService } from '../user/service/user.service';
import { UserEntity } from '../user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeadlineEntity, CourseValueEntity, UserEntity]),
  ],
  controllers: [DeadlineController],
  providers: [
    DeadlineService,
    CourseValueService,
    TracingLoggerService,
    UserService,
  ],
})
export class DeadlineModule {}
