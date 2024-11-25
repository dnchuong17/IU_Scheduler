import { UserEntity } from '../../user/entity/user.entity';

export class schedulerTemplateDto {
  isSynced?: boolean;
  isMainTemplate?: boolean;
  lastSyncTime?: Date;
  user: UserEntity;
}