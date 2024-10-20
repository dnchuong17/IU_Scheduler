import { BaseEntity, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CoursePositionEntity } from '../coursePosition/coursePosition.entity';
import { UserEntity } from '../user/entity/user.entity';

@Entity('scheduler_template')
export class SchedulerTemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'scheduler_id' })
  id: number;

  @OneToMany(
    () => CoursePositionEntity,
    (coursePositions) => coursePositions.scheduler,
  )
  coursePositions: CoursePositionEntity[];

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
