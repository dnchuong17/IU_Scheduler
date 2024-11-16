import { Controller, Get } from '@nestjs/common';
import { SyncDataService } from '../service/sync-data.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncDataService) {
  }

  @Get()
  getDataSynced() {
    return this.syncService.syncData();
  }
}