import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly datasource: DataSource,
  ) {}

  async findAccountWithEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUserInfor(id: number) {
    const query =
      'SELECT student_users.*, scheduler_template.* FROM student_users LEFT JOIN scheduler_template ON' +
      ' student_users.schedule_template_id = scheduler_template.scheduler_id WHERE id=$1';
    const user = await this.datasource.query(query, [id]);
    return user[0];
  }
}
