import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserSettingInfo } from './entity/user-info.entity';
import { RedisHelper } from '../redis/service/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserSettingInfo])],
  controllers: [UserController],
  providers: [UserService, RedisHelper],
})
export class UserModule {}
