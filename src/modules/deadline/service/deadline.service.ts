import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeadlineEntity } from '../entity/deadline.entity';
import { DeadlineDto } from '../dto/deadline.dto';

@Injectable()
export class DeadlineService {
  constructor(
    @InjectRepository(DeadlineEntity)
    private readonly deadlineRepository: Repository<DeadlineEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createDeadline(deadlineDto: DeadlineDto) {
    try {
      await this.deadlineRepository
        .createQueryBuilder()
        .insert()
        .into(DeadlineEntity)
        .values(deadlineDto)
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
