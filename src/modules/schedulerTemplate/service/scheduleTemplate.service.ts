import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerTemplateEntity } from '../entity/schedulerTemplate.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
@Injectable()
export class ScheduleTemplateService {
  // constructor(
  //   @InjectRepository(SchedulerTemplateEntity)
  //   private readonly schedulerTemplateRepo: Repository<SchedulerTemplateEntity>,
  //   @InjectRepository(UserEntity)
  //   private readonly userRepo: Repository<UserEntity>,
  // ) {}
  //
  // async createTemplate(user: UserEntity, id: number) {
  //   const existedTemplate = await this.schedulerTemplateRepo.findOne({
  //     where: { user },
  //   });
  //
  //   if (existedTemplate) {
  //     throw new BadRequestException('User already has a template');
  //   }
  //   const newTemplate = await this.schedulerTemplateRepo.create({
  //     user,
  //   });
  //   await this.userRepo
  //     .createQueryBuilder()
  //     .update(UserEntity)
  //     .set({
  //       schedule_tempalte_id: newTemplate.id,
  //     })
  //     .where('id = :id ', id)
  //     .execute();
  //   return await this.schedulerTemplateRepo.save(newTemplate);
  // }
}
