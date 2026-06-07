import { execSync } from 'child_process';

export default async function globalTeardown() {
  console.log('\n🛑 Stopping test PostgreSQL...');
  execSync('docker compose stop postgres_test', { stdio: 'inherit' });
  console.log('✅ postgres_test stopped\n');
}
