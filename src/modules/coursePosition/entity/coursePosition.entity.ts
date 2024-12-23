import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoursesEntity } from '../../courses/entity/courses.entity';
import { SchedulerTemplateEntity } from '../../schedulerTemplate/entity/schedulerTemplate.entity';

@Entity('course_position')
@Index(['days', 'startPeriod'])
export class CoursePositionEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'course_position_id' })
  id: number;

  @Column({ name: 'days_in_week', nullable: false })
  days: string;

  @Column({ name: 'start_period' })
  startPeriod: number;

  @Column({ name: 'periods', nullable: false })
  periods: number;

  @ManyToOne(
    () => SchedulerTemplateEntity,
    (scheduler) => scheduler.coursePositions,
  )
  scheduler: SchedulerTemplateEntity;

  @OneToOne(() => CoursesEntity, (course) => course.coursePosition)
  @JoinColumn({ name: 'coursesId' })
  courses: CoursesEntity;
}
