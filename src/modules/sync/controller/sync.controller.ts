import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SyncDataService } from '../service/sync-data.service';
import { SessionIdSyncDto } from '../dto/sync.dto';
import { AdminGuard } from '../../../auth/guard/admin.guard';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncDataService) {}

  @UseGuards(AdminGuard)
  @Post('redis')
  getDataSynced(@Body() sessionIdDto: SessionIdSyncDto) {
    return this.syncService.saveSessionIdToCache(sessionIdDto);
  }

  @Post('roadmap')
  syncData() {
    return this.syncService.syncDataFromRoadMap();
  }
}
