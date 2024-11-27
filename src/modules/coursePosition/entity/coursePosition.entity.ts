import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoursesEntity } from '../../courses/entity/courses.entity';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/entity/schedulerTemplate.entity';

@Entity('course_position')
export class CoursePositionEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'course_position_id' })
  id: number;

  @Column({ name: 'days_in_week', nullable: false })
  days: number;

  @Column({ name: 'start_period' })
  startPeriod: number;

  @Column({ name: 'periods', nullable: false })
  periods: number;

  @ManyToOne(
    () => SchedulerTemplateEntity,
    (scheduler) => scheduler.coursePositions,
  )
  scheduler: SchedulerTemplateEntity;

  @ManyToOne(() => CoursesEntity, (course) => course.coursePosition)
  courses: CoursesEntity;
}
