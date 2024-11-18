import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SchedulerTemplateEntity } from '../schedulerTemplate/entity/schedulerTemplate.entity';
import { CoursesEntity } from '../courses/entity/courses.entity';

@Entity('course_position')
export class CoursePositionEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'course_position_id' })
  id: number;

  @Column({ name: 'days_in_week', nullable: false })
  days: number;

  @Column({ name: 'periods', nullable: false })
  periods: number;

  @ManyToOne(
    () => SchedulerTemplateEntity,
    (scheduler) => scheduler.coursePositions,
  )
  scheduler: SchedulerTemplateEntity;

  @OneToMany(() => CoursesEntity, (course) => course.coursePosition)
  courses: CoursesEntity[];
}
