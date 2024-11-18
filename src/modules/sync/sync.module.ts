import { Module } from '@nestjs/common';
import { SyncDataService } from './service/sync-data.service';
import { SyncController } from './controller/sync.controller';
import { HttpModule } from '@nestjs/axios';
import { UserService } from '../user/service/user.service';
import { AuthService } from '../../auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncEventEntity } from './entities/sync-event.entity';
import { UserEntity } from '../user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ScheduleTemplateService } from '../schedulerTemplate/service/scheduleTemplate.service';
import { SchedulerTemplateEntity } from '../schedulerTemplate/entity/schedulerTemplate.entity';
import { CoursesService } from '../courses/service/courses.service';
import { CoursesEntity } from '../courses/entity/courses.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      SyncEventEntity,
      UserEntity,
      SchedulerTemplateEntity,
      CoursesEntity,
    ]),
  ],
  controllers: [SyncController],
  providers: [
    SyncDataService,
    UserService,
    AuthService,
    JwtService,
    ScheduleTemplateService,
    CoursesService,
  ],
})
export class SyncModule {}
