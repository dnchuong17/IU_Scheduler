import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SyncDataService } from '../service/sync-data.service';
import { SessionIdSyncDto } from '../dto/sync.dto';
import { AdminGuard } from '../../../auth/guard/admin.guard';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncDataService) {}

  @UseGuards(AdminGuard)
  @Post('redis')
  getDataSynced(@Body() sessionIdDto: SessionIdSyncDto) {
    try {
      return this.syncService.saveSessionIdToCache(sessionIdDto);
    } catch (error) {
      throw new BadRequestException('Invalid Session Id');
    }
  }

  @Post('roadmap')
  syncDataFromRoadMap() {
    try {
      return this.syncService.syncDataFromRoadMap();
    } catch (error) {
      throw new BadRequestException('Cant sync data from roadmap');
    }
  }

  @Post('schedule/:id')
  syncDataFromSchedule(@Param('id') id: number) {
    try {
      return this.syncService.syncDataFromSchedule(id);
    } catch (error) {
      throw new BadRequestException('Cant sync data from schedule');
    }
  }
}
