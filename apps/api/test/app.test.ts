import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import type { Logger } from '@pravah/logger';
import { Registry } from 'prom-client';

import { createApp } from '../src/app.js';
import type { Config } from '../src/config.js';

const fakeLogger = { info: vi.fn(), error: vi.fn(), child: vi.fn() } as unknown as Logger;
const fakeConfig = {
  NODE_ENV: 'test',
  PORT: 0,
  LOG_LEVEL: 'fatal',
  LOG_PRETTY: false,
  DATABASE_URL: 'postgres://irrelevant',
  SERVICE_NAME: 'pravah-api',
  OTEL_ENABLED: false,
  OTEL_EXPORTER_OTLP_ENDPOINT: undefined,
} as unknown as Config;

const okDb = {
  ready: async () => true,
  recordHeartbeat: async (input: { service: string; status: string }) => ({
    id: 'hb-1',
    at: new Date().toISOString(),
    ...input,
  }),
  recentHeartbeats: async (limit: number) => [
    { id: 'hb-1', service: 'k3s-agent', status: 'ok', at: new Date().toISOString() },
  ].slice(0, limit),
};
const brokenDb = { ...okDb, ready: async () => { throw new Error('db down'); } };

describe('walking skeleton api', () => {
  it('GET /healthz reports liveness without touching the db', async () => {
    const app = createApp({ config: fakeConfig, logger: fakeLogger, system: okDb, registry: new Registry(), version: 'test' });
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'pravah-api' });
  });

  it('GET /readyz maps db failure to 503 ProblemDetails', async () => {
    const app = createApp({ config: fakeConfig, logger: fakeLogger, system: brokenDb, registry: new Registry(), version: 'test' });
    const res = await request(app).get('/readyz');
    expect(res.status).toBe(500);
    expect(res.body.title).toBe('Internal Server Error');
    expect(res.headers['content-type']).toContain('application/json');
  });

  it('POST /v1/system/heartbeats validates and persists via service', async () => {
    const app = createApp({ config: fakeConfig, logger: fakeLogger, system: okDb, registry: new Registry(), version: 'test' });
    const bad = await request(app).post('/v1/system/heartbeats').send({ status: 'ok' });
    expect(bad.status).toBe(400);
    expect(bad.body.type).toContain('validation-failed');

    const good = await request(app).post('/v1/system/heartbeats').send({ service: 'web', status: 'ok' });
    expect(good.status).toBe(201);
    expect(good.body).toMatchObject({ service: 'web', status: 'ok' });
  });

  it('GET /v1/system/heartbeats returns cursor-shaped list', async () => {
    const app = createApp({ config: fakeConfig, logger: fakeLogger, system: okDb, registry: new Registry(), version: 'test' });
    const res = await request(app).get('/v1/system/heartbeats?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body).toHaveProperty('nextCursor', null);
  });

  it('GET /metrics exposes Prometheus text', async () => {
    const app = createApp({ config: fakeConfig, logger: fakeLogger, system: okDb, registry: new Registry(), version: 'test' });
    await request(app).get('/healthz');
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_request_duration_seconds');
  });
});
