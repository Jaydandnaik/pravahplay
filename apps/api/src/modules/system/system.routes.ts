import { Router, type Router as ExRouter } from 'express';
import { z } from 'zod';

import { ValidationError } from '@pravah/errors';

import type { SystemService } from './system.service.js';

const heartbeatInput = z.object({
  service: z.string().min(1).max(100),
  status: z.string().min(1).max(50),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export function systemRoutes(service: SystemService): ExRouter {
  const router = Router();

  router.post('/heartbeats', async (req, res, next) => {
    try {
      const parsed = heartbeatInput.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
      }
      res.status(201).json(await service.recordHeartbeat(parsed.data));
    } catch (err) {
      next(err);
    }
  });

  router.get('/heartbeats', async (req, res, next) => {
    try {
      const limit = Number.parseInt(String(req.query.limit ?? '20'), 10) || 20;
      res.json({ items: await service.recentHeartbeats(limit), nextCursor: null });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
