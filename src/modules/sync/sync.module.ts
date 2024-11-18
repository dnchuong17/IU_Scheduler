import { Module } from '@nestjs/common';
import { SyncDataService } from './service/sync-data.service';
import { SyncController } from './controller/sync.controller';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/service/user.service';
import { AuthService } from '../../auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncEventEntity } from './entities/sync-event.entity';
import { UserEntity } from '../user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ScheduleTemplateService } from '../schedulerTemplate/scheduleTemplate.service';
import { SchedulerTemplateEntity } from '../schedulerTemplate/schedulerTemplate.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      SyncEventEntity,
      UserEntity,
      SchedulerTemplateEntity,
    ]),
  ],
  controllers: [SyncController],
  providers: [
    SyncDataService,
    UserService,
    AuthService,
    JwtService,
    ScheduleTemplateService,
  ],
})
export class SyncModule {}
