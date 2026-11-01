import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import type { Registry } from 'prom-client';

import { isAppError } from '@pravah/errors';
import type { Logger } from '@pravah/logger';
import { createHttpMetrics } from '@pravah/telemetry';

import type { Config } from './config.js';
import type { SystemService } from './modules/system/system.service.js';
import { systemRoutes } from './modules/system/system.routes.js';

export interface AppDeps {
  config: Config;
  logger: Logger;
  system: SystemService;
  registry: Registry;
  version: string;
}

export function createApp({ config, logger, system, registry, version }: AppDeps): Express {
  const app = express();
  const metrics = createHttpMetrics(registry);
  const startedAt = Date.now();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      metrics.observe(req.method, routeLabel(req), res.statusCode, seconds);
      if (res.statusCode >= 500 || req.url.startsWith('/v1')) {
        logger.info({ method: req.method, url: req.url, status: res.statusCode, durMs: +(seconds * 1000).toFixed(1) }, 'req');
      }
    });
    next();
  });

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: config.SERVICE_NAME, version, uptimeS: Math.round((Date.now() - startedAt) / 1000) });
  });

  app.get('/readyz', async (_req, res, next) => {
    try {
      await system.ready();
      res.json({ status: 'ready' });
    } catch (err) {
      next(err);
    }
  });

  app.get('/metrics', async (_req, res) => {
    res.setHeader('content-type', registry.contentType);
    res.end(await registry.metrics());
  });

  const api = express.Router();
  api.use('/system', systemRoutes(system));
  app.use('/v1', api);

  // 404 + RFC 7807 error mapping
  app.use((req, res) => {
    res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404, instance: req.url });
  });
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (isAppError(err)) {
      res.status(err.problem.status).json({ ...err.problem, instance: req.url });
      return;
    }
    logger.error({ err, url: req.url }, 'unhandled error');
    res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, instance: req.url });
  });

  return app;
}

function routeLabel(req: Request): string {
  return req.route?.path ?? (req.path.startsWith('/v1') ? '/v1/:resource' : req.path);
}
