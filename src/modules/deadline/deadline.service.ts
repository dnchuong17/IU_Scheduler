import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeadlineEntity } from './deadline.entity';
import { DeadlineDto } from './deadline.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DeadlineService {
  constructor(
    @InjectRepository(DeadlineEntity)
    private readonly deadlineRepository: Repository<DeadlineEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createDeadline(deadlineDto: DeadlineDto) {
    try {
      const newDeadline = plainToInstance(DeadlineEntity, deadlineDto);
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
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async getAllDeadline() {
    const query = 'SELECT * FROM deadline where is_Active = true';
    return await this.dataSource.query(query);
  }

  async activeAlert(deadlineDto: DeadlineDto, id: number) {
    const active = deadlineDto.isActive;
    try {
      await this.deadlineRepository
        .createQueryBuilder()
        .update(DeadlineEntity)
        .set({
          isActive: !active,
        })
        .where('id = :id', { id })
        .execute();
      return 'turn on alert';
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
