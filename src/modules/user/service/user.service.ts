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
    const query = 'SELECT email FROM user where email=$1';
    const result = await this.datasource.query(query, [email]);
    return result[0] || null;
  }
}
