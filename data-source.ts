import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/modules/users/entities/user.entity';
import { AddSuperAdminAndIsActive20260427000000 } from './src/database/migrations/20260427000000-AddSuperAdminAndIsActive';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  migrations: [AddSuperAdminAndIsActive20260427000000],
  migrationsTableName: 'migrations',
});
