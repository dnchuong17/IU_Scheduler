import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeadlineEntity } from './entity/deadline.entity';
import { DeadlineService } from './service/deadline.service';
import { DeadlineController } from './controller/deadline.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeadlineEntity])],
  controllers: [DeadlineController],
  providers: [DeadlineService],
})
export class DeadlineModule {}
