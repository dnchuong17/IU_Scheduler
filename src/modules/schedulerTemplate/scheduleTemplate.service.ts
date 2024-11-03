import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from './schedulerTemplate.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';
@Injectable()
export class ScheduleTemplateService {
  constructor(
    @InjectRepository(SchedulerTemplateEntity)
    private readonly schedulerTemplateRepo: Repository<SchedulerTemplateEntity>,
  ) {}

  async createTemplate(user: UserEntity) {
    const newTemplate = await this.schedulerTemplateRepo.create({
      user,
    });
    return await this.schedulerTemplateRepo.save(newTemplate);
  }
}
