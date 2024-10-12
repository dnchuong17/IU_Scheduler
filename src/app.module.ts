import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { HealthModule } from './health/health.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    HealthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
