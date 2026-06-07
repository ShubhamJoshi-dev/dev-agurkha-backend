import { execSync } from 'child_process';
import * as net from 'net';

const TEST_DB_URL = 'postgresql://postgres:password@localhost:5435/agurkha_test';
const TEST_PORT = 5435;
const MAX_WAIT_MS = 30_000;

function waitForPort(port: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket
        .once('connect', () => {
          socket.destroy();
          resolve();
        })
        .once('error', () => {
          socket.destroy();
          if (Date.now() - start > MAX_WAIT_MS) {
            reject(new Error(`Port ${port} did not open within ${MAX_WAIT_MS}ms`));
          } else {
            setTimeout(tryConnect, 500);
          }
        })
        .once('timeout', () => {
          socket.destroy();
          setTimeout(tryConnect, 500);
        })
        .connect(port, '127.0.0.1');
    };
    tryConnect();
  });
}

export default async function globalSetup() {
  console.log('\n🐘 Starting test PostgreSQL on port 5435...');
  execSync('docker compose up -d postgres_test', { stdio: 'inherit' });

  await waitForPort(TEST_PORT);
  // Give Postgres a moment to finish initialising after TCP opens
  await new Promise((r) => setTimeout(r, 1500));
  console.log('✅ postgres_test is ready');

  console.log('⚡ Running migrations on test database...');
  execSync(
    `DATABASE_URL=${TEST_DB_URL} npx typeorm-ts-node-commonjs migration:run -d data-source.ts`,
    { stdio: 'inherit' },
  );
  console.log('✅ Migrations applied\n');
}
