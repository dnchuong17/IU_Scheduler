import { Module } from '@nestjs/common';
import { SyncDataService } from './service/sync-data.service';
import { SyncController } from './controller/sync.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SyncController],
  providers: [SyncDataService],
})
export class SyncModule {
}