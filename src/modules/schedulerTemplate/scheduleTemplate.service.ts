import { BadRequestException, Injectable } from '@nestjs/common';
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
    const existedTemplate = await this.schedulerTemplateRepo.findOne({
      where: { user },
    });

    if (existedTemplate) {
      throw new BadRequestException('User already has a template');
    }
    const newTemplate = await this.schedulerTemplateRepo.create({
      user,
    });
    return await this.schedulerTemplateRepo.save(newTemplate);
  }
}
