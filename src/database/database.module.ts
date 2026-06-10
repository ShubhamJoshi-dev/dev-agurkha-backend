import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const url = cfg.get<string>('database.url') ?? '';
        const isRemote = !url.includes('localhost') && !url.includes('127.0.0.1');
        return {
          type: 'postgres' as const,
          url,
          ssl: isRemote ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: false,
          logging: cfg.get<string>('nodeEnv') === 'development',
          extra: {
            max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 5_000,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
