import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoursePositionEntity } from '../coursePosition/coursePosition.entity';
import { CourseValueEntity } from '../courseValue/courseValue.entity';

@Entity('courses')
export class CoursesEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'course_id' })
  id: number;

  @Column({ name: 'course_name' })
  name: string;

  @Column({ name: 'credits' })
  credits: number;

  @Column({ name: 'no_periods' })
  periods: number;

  @ManyToOne(
    () => CoursePositionEntity,
    (coursePosition) => coursePosition.courses,
  )
  coursePosition: CoursePositionEntity;

  @OneToMany(() => CourseValueEntity, (courseValue) => courseValue.courses)
  courseValues: CourseValueEntity[];
}
