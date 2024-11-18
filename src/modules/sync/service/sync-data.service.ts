import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as cheerio from 'cheerio';
import {
  RedisSyncKey,
  SessionPrefix,
  SYNC_EVENT_FROM_ROADMAP,
  SYNC_LOCAL,
  SyncFailReason,
} from '../utils/sync.constant';
import { RedisHelper } from '../../redis/service/redis.service';
import { SessionIdSyncDto } from '../dto/sync.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SyncEventEntity } from '../entities/sync-event.entity';
import { Repository } from 'typeorm';
import { SyncRequestDto } from '../dto/sync-request.dto';
import { UserService } from '../../user/service/user.service';
import { AuthService } from '../../../auth/auth.service';
import { KEY, RoleType } from '../../../common/user.constant';
import { UserEntity } from '../../user/entity/user.entity';
import { UserSettingInfo } from '../../user/entity/user-info.entity';
import { plainToInstance } from 'class-transformer';
import { CoursesService } from '../../courses/service/courses.service';
import { CoursesDto } from '../../courses/dto/courses.dto';

@Injectable()
export class SyncDataService {
  private readonly instance: AxiosInstance;
  private readonly username: string;
  private readonly password: string;

  constructor(
    private readonly logger: TracingLoggerService,
    private readonly configService: ConfigService,
    private readonly redisHelper: RedisHelper,
    @InjectRepository(SyncEventEntity)
    private readonly syncRepo: Repository<SyncEventEntity>,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly courseService: CoursesService,
  ) {
    this.logger.setContext(SyncDataService.name);
    this.instance = axios.create({
      baseURL: this.configService.get<string>('BASE_URL'),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
    this.username = this.configService.get<string>('USERNAME');
    this.password = this.configService.get<string>('PASSWORD');
  }

  async saveSessionIdToCache(sessionIdDto: SessionIdSyncDto) {
    this.logger.debug('[SYNC DATA] Save SessionId from web');
    if (sessionIdDto.sessionId.startsWith(SessionPrefix)) {
      try {
        return await this.redisHelper.set(
          RedisSyncKey,
          sessionIdDto.sessionId,
          60 * 60 * 24,
        );
      } catch (error) {
        this.logger.error('Error saving SessionId to cache', error);
        throw new InternalServerErrorException(
          'Could not save session ID to cache',
        );
      }
    }
  }

  async createSyncEvent(syncReq: SyncRequestDto) {
    const uid = await this.authService.extractUIDFromToken();
    this.logger.debug('[SYNC DATA] check user Id');
    if (!uid) {
      throw new BadRequestException('Invalid UID');
    }
    const environment = await this.configService.get('SYNC_ENV');
    const user = await this.userService.findUserWithUID(uid);
    const syncUser = await this.getSyncUser();
    syncReq.syncUser = environment === SYNC_LOCAL ? user : syncUser;
    await this.syncRepo.create(syncReq);
    this.logger.debug('[SYNC DATA] Sync event created successfully');
  }

  async syncDataFromRoadMap() {
    const startAt = new Date();
    const checkKey = await this.redisHelper.get(RedisSyncKey);
    console.log(checkKey);
    this.logger.debug('[SYNC DATA] check check key');
    const syncReq: SyncRequestDto = <SyncRequestDto>{
      syncEvent: SYNC_EVENT_FROM_ROADMAP,
      startTime: startAt,
    };
    if (!checkKey) {
      syncReq.status = false;
      syncReq.failReason = SyncFailReason.MISS_SESSION_ID;
      const event = await this.createSyncEvent(syncReq);
      this.logger.debug('[SYNC DATA] missing session id');
      return;
    }

    const response = await this.instance.get('/Default.aspx?page=ctdtkhoisv', {
      headers: {
        Cookie: checkKey,
      },
    });
    const $ = cheerio.load(response.data);
    const elements = $('[id*="lkDownload"]');
    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      const courseName = $(element).text().trim();
      const courseCode = $(element)
        .closest('td')
        .prev()
        .find('span')
        .text()
        .trim();
      const credits = $(element)
        .closest('td')
        .next()
        .find('span')
        .text()
        .trim();

      const courseDto = plainToInstance(CoursesDto, {
        courseCode,
        name: courseName,
        credits: Number(credits),
      });
      await this.courseService.createCourse(courseDto);
    }

    return response.data;
  }

  async getSyncUser() {
    const syncAdmin = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user_setting_info', 'info', 'user.id=info.user_id')
      .where('info.role =:value', { value: RoleType.SYNC })
      .getOne();
    return syncAdmin;
  }
}
