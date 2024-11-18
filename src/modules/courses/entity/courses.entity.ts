import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoursePositionEntity } from '../../coursePosition/entity/coursePosition.entity';
import { CourseValueEntity } from '../../courseValue/entity/courseValue.entity';

@Entity('courses')
export class CoursesEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'course_id' })
  id: number;

  @Column({ name: 'course_name', nullable: false })
  name: string;

  @Column({ name: 'credits', nullable: false })
  credits: number;

  @Column({ name: 'no_periods', nullable: false })
  periods: number;

  @ManyToOne(
    () => CoursePositionEntity,
    (coursePosition) => coursePosition.courses,
  )
  coursePosition: CoursePositionEntity;

  @OneToMany(() => CourseValueEntity, (courseValue) => courseValue.courses)
  courseValues: CourseValueEntity[];
}
