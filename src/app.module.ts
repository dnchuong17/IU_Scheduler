import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { HealthModule } from './health/health.module';
import { UserModule } from './modules/user/user.module';
import { CacheInterceptor, CacheModule } from '@nestjs/common/cache';
import { ConfigModule,  } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import * as process from 'process';
import { RedisModule } from './modules/redis/redis.module';
import { RedisConfig } from './modules/redis/dtos/redis-creation.dto';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.register({
      host: process.env.REDIS_HOST.toString(),
      port: Number(process.env.REDIS_PORT),
      accessKey: process.env.REDIS_ACCESS_KEY.toString(),
      isPublic: true,
    } as RedisConfig),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    HealthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
