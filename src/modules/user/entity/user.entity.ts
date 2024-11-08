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
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

@Entity('student_users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Column()
  @IsNotEmpty()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ name: 'student_id' })
  @IsNotEmpty()
  @Length(11, 11, { message: 'Student ID must be 11 characters' })
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
}
