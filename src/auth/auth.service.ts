import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from '../modules/user/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SigninDto } from '../modules/user/dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';

import { SyncDataService } from '../modules/sync/service/sync-data.service';
import { SchedulerTemplateDto } from '../modules/schedulerTemplate/dto/scheduler-Template.dto';
import { UserService } from '../modules/user/service/user.service';
import { UserEntity } from '../modules/user/entity/user.entity';
import { EmailValidationHelper } from '../modules/validation/service/email-validation.helper';
import { RedisHelper } from '../modules/redis/service/redis.service';
import { KEY } from '../common/user.constant';
import { ScheduleTemplateService } from '../modules/schedulerTemplate/service/scheduleTemplate.service';
import { SYNC_EVENT_FROM_SCHEDULE } from '../modules/sync/utils/sync.constant';
import { SyncRealtimeRequestDto } from '../modules/sync/dto/sync-realtime-request.dto';
import { TracingLoggerService } from '../logger/tracing-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly logger: TracingLoggerService,
    private readonly emailValidationHelper: EmailValidationHelper,
    private readonly redisHelper: RedisHelper,
    private readonly schedulerService: ScheduleTemplateService,
    @Inject(forwardRef(() => SyncDataService))
    private readonly syncDataService: SyncDataService,
  ) {
    logger.setContext(AuthService.name);
  }

  async signup(userDto: UserDto) {
    console.log();
    this.logger.debug('sign up');
    const existedUser = await this.userService.findAccountWithEmail(
      userDto.email,
    );
    console.log(userDto);

    if (existedUser) {
      throw new BadRequestException('Email already in use');
    }
    const checkEmailResult = await this.emailValidationHelper.validateEmail(
      userDto.email,
    );
    if (!checkEmailResult) {
      this.logger.debug('Email is not real and fail to validate email');
      throw new BadRequestException('Email is not real email');
    }
    try {
      const hashPassword = await bcrypt.hash(userDto.password, 10);
      const newUser = plainToInstance(UserEntity, {
        name: userDto.name,
        password: hashPassword,
        email: userDto.email,
        studentId: userDto.studentId,
      });
      const user = await this.userRepository.save(newUser);
      console.log('user', user);
      const templateDto = plainToInstance(SchedulerTemplateDto, {
        user: user,
        isMainTemplate: true,
        lastSyncTime: new Date(),
        isSync: true,
      });
      this.logger.debug(
        `[SIGN UP] Create main template for user: ${userDto.studentId}`,
      );
      await this.schedulerService.createTemplate(templateDto);
      this.logger.debug('[SIGN UP] Sync realtime event');
      const syncReq = new SyncRealtimeRequestDto();
      syncReq.syncRealtimeEvent = SYNC_EVENT_FROM_SCHEDULE;
      syncReq.isNew = true;
      syncReq.referenceId = userDto.studentId;

      await this.syncDataService.syncRealtime(syncReq);
      return 'sign up successfully';
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findAccountWithEmail(email);
    try {
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
    return null;
  }

  async signIn(signIn: SigninDto) {
    const isSignIn = await this.validateUser(signIn.email, signIn.password);
    if (isSignIn) {
      const user = await this.userService.findAccountWithEmail(signIn.email);
      const payload = {
        username: signIn.email,
        sub: {
          name: user.name,
          sid: user.studentID,
        },
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = await this.refreshToken(signIn);

      if (refreshToken) {
        await this.redisHelper.set(KEY, refreshToken.refreshToken);
      }

      return {
        accessToken,
        refreshToken: refreshToken.refreshToken,
      };
    } else {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  async refreshToken(signIn: SigninDto) {
    const isSignIn = await this.validateUser(signIn.email, signIn.password);

    if (isSignIn) {
      const user = await this.userService.findAccountWithEmail(signIn.email);
      const payload = {
        username: signIn.email,
        sub: {
          name: user.name,
          studentId: user.studentID,
        },
      };

      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      return {
        refreshToken,
      };
    }
  }

  async extractUIDFromToken() {
    const token = await this.redisHelper.get(KEY);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const decoded = await this.jwtService.decode(token);
      return decoded.sub?.studentId;
    } catch (error) {
      this.logger.error('Failed to verify token');
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
