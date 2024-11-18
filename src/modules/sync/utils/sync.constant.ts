export const SessionPrefix = 'ASP.NET_SessionId';
export const RedisSyncKey = 'redis_key';
export const SYNC_EVENT_FROM_ROADMAP = 'sync_data_from_roadmap';
export const SYNC_EVENT_FROM_SCHEDULE = 'sync_data_from_schedule';
export enum SyncFailReason {
  MISS_SESSION_ID = 'miss_sessionId',
  TIMEOUT = 'sync_time_out',
  EXISTED_COURSE = 'course is existed',
}
export const SYNC_LOCAL = 'local';
