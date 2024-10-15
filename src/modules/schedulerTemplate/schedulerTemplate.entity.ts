import { BaseEntity, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CoursePositionEntity } from '../coursePosition/coursePosition.entity';

@Entity('scheduler_template')
export class SchedulerTemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'scheduler_id' })
  id: number;

  @OneToMany(
    () => CoursePositionEntity,
    (coursePositions) => coursePositions.scheduler,
  )
  coursePositions: CoursePositionEntity[];
}
