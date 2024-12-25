import {
  BadRequestException,
  forwardRef,
  Inject,
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
  SYNC_EVENT_FROM_SCHEDULE,
  SYNC_LOCAL,
  SyncFailReason,
} from '../utils/sync.constant';
import { RedisHelper } from '../../redis/service/redis.service';
import { SessionIdSyncDto } from '../dto/sync.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SyncEventEntity } from '../entities/sync-event.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { SyncRequestDto } from '../dto/sync-request.dto';
import { UserService } from '../../user/service/user.service';
import { AuthService } from '../../../auth/auth.service';
import { RoleType } from '../../../common/user.constant';
import { UserEntity } from '../../user/entity/user.entity';
import { plainToInstance } from 'class-transformer';
import { CoursesService } from '../../courses/service/courses.service';
import { CoursesDto } from '../../courses/dto/courses.dto';
import { CourseValueService } from '../../courseValue/service/courseValue.service';
import { CourseValueDto } from '../../courseValue/dto/courseValue.dto';
import { CoursesEntity } from '../../courses/entity/courses.entity';
import { SYNC_POOL_NAME } from './sync-pool.config';
import { Queue } from 'bullmq';
import { SyncRealTimeEntity } from '../entities/sync-real-time.entity';
import { SyncRealtimeRequestDto } from '../dto/sync-realtime-request.dto';
import { CoursePositionDto } from '../../coursePosition/dto/coursePosition.dto';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/entity/schedulerTemplate.entity';
import { ScheduleTemplateService } from '../../schedulerTemplate/service/scheduleTemplate.service';
import { CoursePositionService } from '../../coursePosition/service/coursePosition.service';
import { CourseValueEntity } from '../../courseValue/entity/courseValue.entity';
import { NoteEntity } from '../../note/entity/note.entity';

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
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @Inject(forwardRef(() => CoursesService))
    private readonly courseService: CoursesService,
    private readonly courseValueService: CourseValueService,
    @Inject(SYNC_POOL_NAME) private readonly syncQueue: Queue,
    @InjectRepository(SyncRealTimeEntity)
    private readonly syncRealtimeRepo: Repository<SyncRealTimeEntity>,
    private readonly dataSource: DataSource,
    private readonly schedulerService: ScheduleTemplateService,
    private readonly coursePosService: CoursePositionService,
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
        this.logger.error('Error saving SessionId to cache');
        throw new InternalServerErrorException(
          'Could not save session ID to cache',
        );
      }
    }
  }

  async createSyncEvent(syncReq: SyncRequestDto) {
    this.logger.debug('[SYNC DATA] check user Id');
    const environment = await this.configService.get('SYNC_ENV');
    this.logger.debug(`[SYNC DATA] environment ${environment}`);
    if (environment === SYNC_LOCAL) {
      const uid = await this.authService.extractUIDFromToken();
      if (!uid) {
        throw new BadRequestException('Invalid UID');
      }
      const user = await this.userService.findUserWithUID(uid);
      syncReq.syncUser = user;
    } else {
      const syncUser = await this.getSyncUser();
      syncReq.syncUser = syncUser;
    }

    const syncEvent = plainToInstance(SyncEventEntity, {
      syncEvent: syncReq.syncEvent,
      startTime: syncReq.startTime,
      finishTime: syncReq.finishTime,
      status: syncReq.status,
      failReason: syncReq.failReason,
      user: syncReq.syncUser,
    });
    await this.syncRepo.save(syncEvent);
    this.logger.debug('[SYNC DATA] Sync event created successfully');
  }

  async syncDataFromRoadMap() {
    const startAt = new Date();
    const checkKey = await this.redisHelper.get(RedisSyncKey);
    this.logger.debug('[SYNC DATA FROM ROAD MAP] check check key');
    const syncReq: SyncRequestDto = <SyncRequestDto>{
      syncEvent: SYNC_EVENT_FROM_ROADMAP,
      startTime: startAt,
    };
    if (!checkKey) {
      syncReq.status = false;
      syncReq.failReason = SyncFailReason.MISS_SESSION_ID;
      await this.createSyncEvent(syncReq);
      this.logger.debug('[SYNC DATA FROM ROAD MAP] missing session id');
      return;
    }
    const existCourseCodes = new Set(await this.courseService.getAllCourses());

    const response = await this.instance.get('/Default.aspx?page=ctdtkhoisv', {
      headers: { Cookie: checkKey },
    });
    const $ = cheerio.load(response.data);
    const elements = $('[id*="lkDownload"]');
    const courseDtos = elements
      .map((_, element) => {
        const $element = $(element);
        const courseCode = $element
          .closest('td')
          .prev()
          .find('span')
          .text()
          .trim();
        const courseName = $element.text().trim();
        const credits = Number(
          $element.closest('td').next().find('span').text().trim(),
        );

        return plainToInstance(CoursesDto, {
          courseCode,
          name: courseName,
          credits,
          isNew: true,
        });
      })
      .get();

    const createdCourses = await Promise.all(
      courseDtos.map(async (courseDto) => {
        if (existCourseCodes.has(courseDto.courseCode)) {
          this.logger.debug(
            `[SYNC DATA FROM ROAD MAP] Skipping existing course: ${courseDto.courseCode}`,
          );
          return null; // Skip existing courses
        }

        await this.courseService.createCourse(courseDto);
        this.logger.debug(
          `[SYNC DATA FROM ROAD MAP] Successfully created course: ${courseDto.courseCode}`,
        );
        return courseDto.courseCode;
      }),
    );

    const newCourses = createdCourses.filter((code) => code !== null);

    syncReq.status = true;
    syncReq.failReason = null;
    syncReq.finishTime = new Date();
    await this.createSyncEvent(syncReq);

    this.logger.debug(
      `[SYNC DATA FROM ROAD MAP] Sync completed. New courses created: ${newCourses.length}`,
    );
  }

  async processSyncSchedulerData(studentIdList?: string[]) {
    this.logger.debug('Start to get data for sync scheduler');
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 7);
    const studentIds = await this.userRepo
      .createQueryBuilder('studentUser') // Declare the alias for 'studentUser'
      .innerJoin(
        'studentUser.scheduler', // Use the 'scheduler' relationship from UserEntity
        'template',
        'studentUser.id = template."userId"', // Assuming 'userId' is the foreign key in 'scheduler_template'
      )
      .where('template.is_main_template = :value', { value: true })
      .andWhere(
        '(template.lastsynctime < :date OR template.lastsynctime IS NULL)',
        { date: startTime },
      )
      .getMany();

    this.logger.debug(`Total found ${studentIds.length} studentIds`);

    let filerStudent = studentIds.filter((student) =>
      studentIdList?.includes(student.studentID),
    );
    if (filerStudent.length === 0) {
      filerStudent = studentIds;
    }

    this.logger.debug(`Total filtered out ${filerStudent.length} studentIds`);
    for (const userEntity of filerStudent) {
      const data = {
        studentId: userEntity.studentID,
      };
      this.logger.debug(`Put ${data.studentId} into queue`);
      await this.syncQueue.add(userEntity.studentID, data, {
        removeOnComplete: true,
        removeOnFail: true,
        jobId: userEntity.studentID,
        delay: 0,
      });
    }
  }

  async getJobCount() {
    // const failedJobs = await this.syncQueue.getFailed();
    //
    // for (const job of failedJobs) {
    //   console.log(`Removing failed job ID: ${job.id}`);
    //   await job.remove();
    // }
    return await this.syncQueue.getJobCounts();
  }

  async syncDataFromSchedule(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    const syncReq: SyncRequestDto = <SyncRequestDto>{
      syncEvent: SYNC_EVENT_FROM_SCHEDULE,
      startTime: new Date(),
      status: false,
    };

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const checkKey = await this.redisHelper.get(RedisSyncKey);
      this.logger.debug('[SYNC DATA FROM SCHEDULE] Check session key');

      if (!checkKey) {
        syncReq.failReason = SyncFailReason.MISS_SESSION_ID;
        this.logger.warn('[SYNC DATA FROM SCHEDULE] Missing session ID');
        return;
      }

      const courses = await this.courseService.getCourses();
      const courseCodeMap = new Map<string, CoursesEntity>();
      courses.forEach((course) => {
        const baseCourseCode = course.courseCode
          .substring(0, 8)
          .trim()
          .toUpperCase();
        courseCodeMap.set(baseCourseCode, course);
      });

      const response = await this.instance.get(
        `/Default.aspx?page=thoikhoabieu&sta=0&id=${id}`,
        { headers: { Cookie: checkKey } },
      );

      const $ = cheerio.load(response.data);
      const template = await this.schedulerService.getTemplateBySID(id);

      if (!template) {
        syncReq.failReason = SyncFailReason.TEMPLATE_NOT_FOUND;
        this.logger.error(
          `[SYNC DATA FROM SCHEDULE] Template not found for ID: ${id}`,
        );
        return;
      }

      const allCourseDetails: CourseValueDto[] = [];
      const allCoursePositions: CoursePositionDto[] = [];

      $('td[onmouseover^="ddrivetip"]').each(async (_, element) => {
        const $element = $(element);
        const onmouseoverAttr = $element.attr('onmouseover');
        if (onmouseoverAttr) {
          const paramsString = onmouseoverAttr.match(/ddrivetip\((.+)\)/)?.[1];
          if (paramsString) {
            const params = paramsString
              .split(',')
              .map((param) => param.replace(/'/g, '').trim());

            // Extract course details
            const courseCodeFull = params[2].toUpperCase().trim();
            const baseCourseCode =
              courseCodeFull.match(/^([A-Z0-9]+)/)?.[0] ?? '';
            const courseName = $element.find('span').first().text().trim();
            const credits = parseInt(params[6], 10) || 0;

            // Check if course exists, create it if not
            let course = courseCodeMap.get(baseCourseCode);
            if (!course) {
              this.logger.debug(
                `[SYNC DATA FROM SCHEDULE] Creating new course: ${baseCourseCode}`,
              );
              course = await this.courseService.createCourse({
                courseCode: baseCourseCode,
                name: courseName,
                credits: credits,
                isNew: true,
              });
              courseCodeMap.set(baseCourseCode, course); // Update the map
            }

            // Create position DTO
            const coursePosDto = plainToInstance(CoursePositionDto, {
              days: params[3],
              startPeriod: parseInt(params[6], 10) || null,
              periods: parseInt(params[7], 10) || null,
              scheduler: template,
              courses: course,
              isLab: params[5].startsWith('LA'), // Check if location starts with "LA"
            });

            // Create value DTO
            const courseValueDto = plainToInstance(CourseValueDto, {
              lecture: params[8],
              location: params[5],
              numberOfPeriods: parseInt(params[7], 10) || null,
              courses: course,
              scheduler: template,
            });

            allCoursePositions.push(coursePosDto);
            allCourseDetails.push(courseValueDto);
          }
        }
      });

      // Delete existing course values and replace them with new ones
      if (allCourseDetails.length > 0) {
        this.logger.debug(
          `[SYNC DATA FROM SCHEDULE] Deleting existing course values for template ID: ${template.id}`,
        );
        await this.courseValueService.deleteByTemplateId(
          template.id,
          queryRunner.manager,
        );

        for (const courseValueDto of allCourseDetails) {
          await this.courseValueService.createCourseValue(
            courseValueDto,
            queryRunner.manager,
          );
        }
        this.logger.debug(
          '[SYNC DATA FROM SCHEDULE] New course values created successfully',
        );
      }

      for (const coursePosDto of allCoursePositions) {
        const exists =
          await this.coursePosService.existsCoursePosition(coursePosDto);
        if (!exists) {
          await this.coursePosService.createCoursePos(
            coursePosDto,
            queryRunner.manager,
          );
        }
      }

      syncReq.status = true;
      syncReq.finishTime = new Date();

      await queryRunner.commitTransaction();
      this.logger.debug('[SYNC DATA FROM SCHEDULE] Transaction committed');
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      syncReq.failReason = error.message;
      this.logger.error(
        `[SYNC DATA FROM SCHEDULE] Transaction failed: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
      await this.createSyncEvent(syncReq);
      this.logger.debug('[SYNC DATA FROM SCHEDULE] Sync event created');
    }
  }

  async syncRealtime(syncRealtimeReq: SyncRealtimeRequestDto) {
    const event = await this.syncRealtimeRepo.create({
      syncEvent: syncRealtimeReq.syncRealtimeEvent,
      isNew: syncRealtimeReq.isNew,
      referenceId: syncRealtimeReq.referenceId,
    });
    return await this.syncRealtimeRepo.save(event);
  }

  async processingSyncRealtime() {
    const query =
      'SELECT reference_id FROM sync_realtime WHERE is_new = true AND sync_event = $1';
    const UID = await this.dataSource.query(query, [SYNC_EVENT_FROM_SCHEDULE]);
    for (const { reference_id } of UID) {
      console.log(reference_id);
      await this.syncDataFromSchedule(reference_id);
      await this.markSyncAsProcessed(reference_id);
    }
  }

  async markSyncAsProcessed(referenceId: string) {
    await this.syncRealtimeRepo.update(
      { referenceId, isNew: true },
      { isNew: false },
    );
    this.logger.debug('[SYNC REALTIME] Marked sync event as processed');
  }

  async getSyncUser() {
    const syncAdmin = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user_setting_info', 'info', 'user.id=info.user_id')
      .where('info.role =:value', { value: RoleType.SYNC })
      .getOne();
    return syncAdmin;
  }

  async deleteByTemplateId(
    templateId: number,
    manager: EntityManager,
  ): Promise<void> {
    const courseValues = await manager.find(CourseValueEntity, {
      where: { scheduler: { id: templateId } },
      relations: ['note'],
    });

    if (!courseValues.length) {
      this.logger.debug(
        `[DELETE BY TEMPLATE ID] No course values found for template ID: ${templateId}`,
      );
      return;
    }

    // Step 2: Collect Note IDs
    const noteIds = courseValues
      .map((courseValue) => courseValue.note?.id)
      .filter((id): id is number => !!id);

    // Step 3: Delete Notes
    if (noteIds.length) {
      await manager.delete(NoteEntity, noteIds);
      this.logger.debug(
        `[DELETE NOTES] Deleted ${noteIds.length} notes successfully.`,
      );
    }

    // Step 4: Delete CourseValues
    const courseValueIds = courseValues.map((courseValue) => courseValue.id);
    await manager.delete(CourseValueEntity, courseValueIds);
    this.logger.debug(
      `[DELETE COURSE VALUES] Deleted ${courseValueIds.length} course values successfully.`,
    );
  }
}
