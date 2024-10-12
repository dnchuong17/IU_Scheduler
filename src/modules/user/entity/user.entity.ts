import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSettingInfo } from './user-info.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToOne(
    () => UserSettingInfo,
    (userSettingInfo: UserSettingInfo) => userSettingInfo.user,
  )
  userSettingInfo: UserSettingInfo;
}
