import { UserEntity } from '../../user/entity/user.entity';

export class SchedulerTemplateDto {
  isSynced?: boolean;
  isMainTemplate?: boolean;
  lastSyncTime?: Date;
  user: UserEntity;
}