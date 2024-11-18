import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSettingInfo } from './user-info.entity';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/schedulerTemplate.entity';
import { DeadlineEntity } from '../../deadline/deadline.entity';
import { SyncEventEntity } from '../../sync/entities/sync-event.entity';

@Entity('student_users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ name: 'student_id' })
  studentID: string;

  @OneToOne(
    () => UserSettingInfo,
    (userSettingInfo: UserSettingInfo) => userSettingInfo.user,
  )
  userSettingInfo: UserSettingInfo;

  @OneToOne(
    () => SchedulerTemplateEntity,
    (scheduleTemplate) => scheduleTemplate.user,
    {
      cascade: true,
    },
  )
  @JoinColumn({ name: 'schedule_template_id' })
  scheduleTemplate: SchedulerTemplateEntity;

  @OneToMany(() => DeadlineEntity, (deadlines) => deadlines.user)
  deadlines: DeadlineEntity[];

  @OneToMany(() => SyncEventEntity, (syncEvents) => syncEvents.user)
  syncEvents: SyncEventEntity[];
}
