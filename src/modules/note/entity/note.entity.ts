import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseValueEntity } from '../../courseValue/entity/courseValue.entity';

@Entity({ name: 'note' })
export class NoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'note_content',
    nullable: true,
    type: 'varchar',
    length: 1000,
  })
  content: string;

  @OneToOne(() => CourseValueEntity, (courseValues) => courseValues.note, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_value_id' })
  courseValues: CourseValueEntity;
}
