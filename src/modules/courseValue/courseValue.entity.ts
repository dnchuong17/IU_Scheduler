import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CoursesEntity } from '../courses/courses.entity';

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

  @ManyToOne( () => CoursesEntity, courses => courses.courseValue)
  courses: CoursesEntity;
}
