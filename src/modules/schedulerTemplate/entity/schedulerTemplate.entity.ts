import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { CoursePositionEntity } from '../../coursePosition/entity/coursePosition.entity';

@Entity('scheduler_template')
export class SchedulerTemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'scheduler_id' })
  id: number;

  @OneToMany(
    () => CoursePositionEntity,
    (coursePositions) => coursePositions.scheduler,
  )
  coursePositions: CoursePositionEntity[];

  @OneToOne(() => UserEntity, (user) => user.scheduleTemplate)
  user: UserEntity;

  @Column({ name: 'isSynced', type: 'boolean', default: false })
  isSynced: boolean;
}
