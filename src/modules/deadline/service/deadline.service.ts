import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeadlineEntity } from '../entity/deadline.entity';
import { DeadlineDto } from '../dto/deadline.dto';
import { CourseValueService } from '../../courseValue/service/courseValue.service';

@Injectable()
export class DeadlineService {
  constructor(
    @InjectRepository(DeadlineEntity)
    private readonly deadlineRepository: Repository<DeadlineEntity>,
    private readonly dataSource: DataSource,
    private readonly courseValueService: CourseValueService,
  ) {}

  async createDeadline(deadlineDto: DeadlineDto) {
    const existCourseValue = await this.courseValueService.getCourseValue(
      deadlineDto.courseValueId,
    );
    if (existCourseValue) {
      await this.deadlineRepository
        .createQueryBuilder()
        .insert()
        .into(DeadlineEntity)
        .values({
          isActive: deadlineDto.isActive,
          deadlineType: deadlineDto.deadlineType,
          priority: deadlineDto.priority,
          description: deadlineDto.description,
          deadline: deadlineDto.date,
          courseValue: existCourseValue,
        })
        .execute();
    }
    return {
      message: 'create deadline successfully',
    };
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
