import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { RedisHelper } from '../../redis/service/redis.service';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly datasource: DataSource,
    private readonly redisHelper: RedisHelper,
    private readonly logger: TracingLoggerService,
  ) {}

  async findAccountWithEmail(email: string) {
    this.logger.debug(`[FIND USER]-Find user via email ${email}`);
    const cacheUser = await this.redisHelper.get(email);
    if (cacheUser) {
      this.logger.debug('Found user from cache');
      return JSON.parse(cacheUser);
    }
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      await this.redisHelper.set(user.email, JSON.stringify(user));
    }
    return user;
  }
}
