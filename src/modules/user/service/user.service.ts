import { BadRequestException, Injectable } from '@nestjs/common';
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

  async findUserWithUID(studentId: string) {
    if (!studentId) {
      this.logger.error('[FIND USER] - Student ID is undefined or invalid');
      throw new BadRequestException('Invalid student ID');
    }

    this.logger.debug(
      `[FIND USER] - Finding user via student ID: ${studentId}`,
    );

    const user = await this.userRepository.findOne({
      where: { studentID: studentId },
    });

    if (!user) {
      this.logger.error(
        `[FIND USER] - User not found for student ID: ${studentId}`,
      );
      throw new BadRequestException(
        `User not found for student ID: ${studentId}`,
      );
    }

    this.logger.debug(
      `[FIND USER] - User found: ${JSON.stringify({ id: user.id, name: user.name })}`,
    );

    return user;
  }

  async getUserInfor(id: number) {
    const query = `
    SELECT 
      u.email, 
      u.name, 
      u.student_id, 
      ARRAY_AGG(st.scheduler_id) AS scheduler_ids
    FROM 
      student_users AS u 
    LEFT JOIN 
      scheduler_template AS st 
    ON 
      u.id = st."userId"
    WHERE 
      u.id = $1
    GROUP BY 
      u.email, u.name, u.student_id
  `;
    const user = await this.datasource.query(query, [id]);

    if (!user || user.length === 0) {
      throw new Error('User not found');
    }

    return user[0];
  }


}
