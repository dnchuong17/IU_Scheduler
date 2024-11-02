import { Module } from '@nestjs/common';
import { UserModule } from '../modules/user/user.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../modules/user/service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../modules/user/entity/user.entity';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshTokenStrategy } from './strategy/refreshToken.strategy';
import { AuthController } from './auth.controller';
import { ScheduleTemplateModule } from '../modules/schedulerTemplate/scheduleTemplate.module';
import { SchedulerTemplateEntity } from '../modules/schedulerTemplate/schedulerTemplate.entity';
import { ScheduleTemplateService } from '../modules/schedulerTemplate/scheduleTemplate.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ScheduleTemplateModule,
    JwtModule.register({
      secret: '${process.env.SECRETEKEY}',
      signOptions: { expiresIn: '300s' },
    }),
    TypeOrmModule.forFeature([UserEntity, SchedulerTemplateEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    RefreshTokenStrategy,
    UserService,
    ScheduleTemplateService,
  ],
})
export class AuthModule {}
