import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseValueEntity } from '../courseValue/courseValue.entity';
import { DeadlinePriorityConstant } from '../../common/deadlinePriority.constant';

Entity('deadline');
export class DeadlineEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'UID' })
  id: number;

  @Column({ name: 'is_Active', default: false })
  isActive: boolean;

  @Column({ name: 'priority', nullable: true })
  priority: DeadlinePriorityConstant;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'deadline' })
  deadline: Date;

  @ManyToOne(() => CourseValueEntity, (courseValue) => courseValue.deadlines)
  courseValue: CourseValueEntity;
}
