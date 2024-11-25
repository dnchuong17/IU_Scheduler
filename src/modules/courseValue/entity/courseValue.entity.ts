import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoursesEntity } from '../../courses/entity/courses.entity';
import { DeadlineEntity } from '../../deadline/entity/deadline.entity';

@Entity('course_value')
export class CourseValueEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'course_value_id' })
  id: number;

  @Column({ name: 'start_period', nullable: false })
  startPeriod: number;

  @Column({ name: 'lecture', nullable: false })
  lecture: string;

  @Column({ name: 'location', nullable: false })
  location: string;

  @Column({ name: 'date' })
  dayOfWeek: string;

  @Column({ name: 'group', nullable: true })
  group: number;

  @Column({ name: 'lab_group' })
  labGroup: number;

  @Column({ name: 'no_periods', nullable: false, type: 'int' })
  numberOfPeriods: number;

  @ManyToOne(() => CoursesEntity, (courses) => courses.courseValues)
  courses: CoursesEntity;

  @OneToMany(() => DeadlineEntity, (deadline) => deadline.courseValue)
  deadlines: DeadlineEntity[];
}
