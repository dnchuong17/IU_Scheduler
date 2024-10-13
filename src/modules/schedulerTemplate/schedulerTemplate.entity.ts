import { BaseEntity, Entity, PrimaryGeneratedColumn } from 'typeorm';

Entity('scheduler_template');
export class SchedulerTemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'scheduler_id' })
  id: number;
}
