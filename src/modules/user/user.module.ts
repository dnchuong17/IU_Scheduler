import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserSettingInfo } from './entity/user-info.entity';
import { ScheduleTemplateModule } from '../schedulerTemplate/scheduleTemplate.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserSettingInfo, ScheduleTemplateModule])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
