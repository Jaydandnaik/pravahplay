import { createApp } from './app.js';
import { config } from './config.js';
import { createDb } from './db/client.js';
import { createSystemRepository } from './modules/system/system.repository.js';
import { createSystemService } from './modules/system/system.service.js';
import { createLogger } from '@pravah/logger';
import { createMetricsRegistry, startTracing } from '@pravah/telemetry';

const logger = createLogger({
  service: config.SERVICE_NAME,
  level: config.LOG_LEVEL,
  pretty: config.LOG_PRETTY,
  base: { env: config.NODE_ENV },
});

await startTracing({
  serviceName: config.SERVICE_NAME,
  enabled: config.OTEL_ENABLED,
  otlpEndpoint: config.OTEL_EXPORTER_OTLP_ENDPOINT,
});

const db = createDb(config.DATABASE_URL);
const repo = createSystemRepository(db);
const app = createApp({
  config,
  logger,
  system: createSystemService(repo),
  registry: createMetricsRegistry(config.SERVICE_NAME),
  version: process.env.APP_VERSION ?? 'dev',
});

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'pravah-api listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await db.pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
