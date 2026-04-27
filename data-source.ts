import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/modules/users/entities/user.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
