import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeadlineEntity } from './deadline.entity';
import { DeadlineService } from './deadline.service';
import { DeadlineController } from './deadline.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeadlineEntity])],
  controllers: [DeadlineController],
  providers: [DeadlineService],
})
export class DeadlineModule {}
