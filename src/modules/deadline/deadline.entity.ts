import { BaseEntity, Column, Entity } from 'typeorm';

Entity('deadline');
export class DeadlineEntity extends BaseEntity {
  @Column({ name: 'is_Active', default: false })
  isActive: boolean;
}
