import type { Heartbeat } from '@pravah/types';

import type { NewHeartbeat } from '../../db/schema.js';
import type { SystemRepository } from './system.repository.js';

export interface SystemService {
  ready(): Promise<boolean>;
  recordHeartbeat(input: { service: string; status: string; payload?: Record<string, unknown> }): Promise<Heartbeat>;
  recentHeartbeats(limit: number): Promise<Heartbeat[]>;
}

export function createSystemService(repo: SystemRepository): SystemService {
  return {
    ready: () => repo.ready(),

    recordHeartbeat(input) {
      const hb: NewHeartbeat = {
        service: input.service,
        status: input.status,
        ...(input.payload ? { payload: input.payload } : {}),
      };
      return repo.addHeartbeat(hb);
    },

    recentHeartbeats(limit: number) {
      return repo.listHeartbeats(limit);
    },
  };
}
