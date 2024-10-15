import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoursesEntity } from '../courses/courses.entity';
import { DeadlineEntity } from '../deadline/deadline.entity';

Entity('course_value');
export class CourseValueEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'course_value_id' })
  id: number;

  @Column({ name: 'start_period' })
  startPeriod: number;

  @Column({ name: 'lecture' })
  lecture: string;

  @Column({ name: 'location' })
  location: string;

  @Column({ name: 'date' })
  date: string;

  @ManyToOne(() => CoursesEntity, (courses) => courses.courseValue)
  courses: CoursesEntity;

  @OneToMany( () => DeadlineEntity, (deadline) => deadline.courseValue)
  deadlines: DeadlineEntity[];
}
