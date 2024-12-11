import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoursePositionEntity } from '../../coursePosition/entity/coursePosition.entity';
import { CourseValueEntity } from '../../courseValue/entity/courseValue.entity';
import { NoteEntity } from '../../note/entity/note.entity';

@Entity('courses')
export class CoursesEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'course_id' })
  id: number;

  @Column({ name: 'course_name', nullable: false })
  name: string;

  @Column({ name: 'credits', nullable: false })
  credits: number;

  @Column({
    name: 'course_code',
    nullable: false,
    type: 'varchar',
    length: 255,
    unique: true,
  })
  courseCode: string;

  @Column({ name: 'isNew', nullable: false, type: 'boolean' })
  isNew: boolean;

  @OneToOne(
    () => CoursePositionEntity,
    (coursePosition) => coursePosition.courses,
  )
  coursePosition: CoursePositionEntity;

  @OneToMany(() => CourseValueEntity, (courseValue) => courseValue.courses)
  courseValues: CourseValueEntity[];

  @OneToOne(() => NoteEntity, (note) => note.course)
  note: NoteEntity;
}
