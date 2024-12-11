import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {CoursesEntity} from "../../courses/entity/courses.entity";

@Entity({ name: 'note' })
export class NoteEntity {
  @PrimaryGeneratedColumn({ name: 'note_id' })
  id: number;

  @Column({
    name: 'note_description',
    nullable: true,
    type: 'varchar',
    length: 1000,
  })
  description: string;

  @OneToOne(() => CoursesEntity,(course) => course.note,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: CoursesEntity;
}
