import { Module, OnModuleInit } from '@nestjs/common';
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
import { CourseValueService } from '../courseValue/service/courseValue.service';
import { CourseValueEntity } from '../courseValue/entity/courseValue.entity';
import { SYNC_PROCESSOR, syncPoolConfig } from './service/sync-pool.config';
import { RedisModule } from '../redis/redis.module';
import { SYNC_DATA_SERVICE } from './utils/sync.constant';
import { ModuleRef } from '@nestjs/core';

@Module({
  imports: [
    RedisModule,
    HttpModule,
    TypeOrmModule.forFeature([
      SyncEventEntity,
      UserEntity,
      SchedulerTemplateEntity,
      CoursesEntity,
      CourseValueEntity,
    ]),
  ],
  controllers: [SyncController],
  providers: [
    UserService,
    AuthService,
    JwtService,
    ScheduleTemplateService,
    CoursesService,
    CourseValueService,
    {
      provide: SYNC_DATA_SERVICE,
      useClass: SyncDataService,
    },
    ...syncPoolConfig,
  ],
  exports: [SYNC_DATA_SERVICE],
})
export class SyncModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef, // Dependency inject ModuleRef
  ) {}
  async onModuleInit(): Promise<void> {
    await this.moduleRef.get(SYNC_PROCESSOR, { strict: false });
  }
}
