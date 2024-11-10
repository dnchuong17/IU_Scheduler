import { Module, Global, DynamicModule } from '@nestjs/common';
import Redis from 'ioredis';
import { IOREDIS } from './redis.constant';
import { RedisHelper } from './service/redis.service';
import { RedisConfig } from './dtos/redis-creation.dto';

@Global()
@Module({})
export class RedisModule {
  static register(redisConfig: RedisConfig): DynamicModule {
    const redisInstance = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.accessKey,
      tls: {},
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
    });

    const ioredisProvider = {
      provide: IOREDIS,
      useValue: redisInstance,
    };

    return {
      module: RedisModule,
      providers: [ioredisProvider, RedisHelper],
      exports: [ioredisProvider, RedisHelper],
      global: true,
    };
  }
}
