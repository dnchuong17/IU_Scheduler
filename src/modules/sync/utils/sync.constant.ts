export const SessionPrefix = 'ASP.NET_SessionId';
export const RedisSyncKey = 'redis_key';
export const SYNC_EVENT_FROM_ROADMAP = 'sync_data_from_roadmap';
export const SYNC_EVENT_FROM_SCHEDULE = 'sync_data_from_schedule';
export enum SyncFailReason {
  MISS_SESSION_ID = 'miss_sessionId',
  TIMEOUT = 'sync_time_out',
  EXISTED_COURSE = 'course is existed',
  EXISTED_COURSE_VALUE = 'course value is existed',
  NO_NEW_COURSE_VALUE = 'no new course value is created',
}
export const SYNC_LOCAL = 'local';
export const SYNC_DATA_SERVICE = 'SYNC_DATA_SERVICE';
