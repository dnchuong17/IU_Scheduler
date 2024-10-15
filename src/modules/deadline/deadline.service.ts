import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeadlineEntity } from './deadline.entity';
import { DeadlineDto } from './deadline.dto';
import e from 'express';

@Injectable()
export class DeadlineService {
  constructor(
    @InjectRepository(DeadlineEntity)
    private readonly deadlineRepository: Repository<DeadlineEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createDeadline(deadlineDto: DeadlineDto) {
    try {
      const newDeadline = await this.deadlineRepository.create(deadlineDto);
      await this.deadlineRepository
        .createQueryBuilder()
        .insert()
        .into(DeadlineEntity)
        .values(newDeadline)
        .execute();
      return {
        message: 'create deadline successfully',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
