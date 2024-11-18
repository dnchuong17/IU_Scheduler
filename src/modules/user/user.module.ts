import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserSettingInfo } from './entity/user-info.entity';
import { RedisHelper } from '../redis/service/redis.service';
import { ScheduleTemplateModule } from '../schedulerTemplate/scheduleTemplate.module';
import { TracingLoggerService } from '../../logger/tracing-logger.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserSettingInfo,
      ScheduleTemplateModule,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, RedisHelper, TracingLoggerService, TypeOrmModule],
  exports: [UserService],
})
export class UserModule {}
