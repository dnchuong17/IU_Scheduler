import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ){}
  @Get()
  checkHealth(){
    return this.health.check([
      ()=> this.db.pingCheck('database')
    ])
  }
}