import { desc } from 'drizzle-orm';

import type { Heartbeat } from '@pravah/types';

import type { Db } from '../../db/client.js';
import { heartbeats, type NewHeartbeat } from '../../db/schema.js';

export interface SystemRepository {
  ready(): Promise<boolean>;
  addHeartbeat(hb: NewHeartbeat): Promise<Heartbeat>;
  listHeartbeats(limit: number): Promise<Heartbeat[]>;
}

export function createSystemRepository(db: Db): SystemRepository {
  return {
    async ready() {
      await db.pool.query('SELECT 1');
      return true;
    },

    async addHeartbeat(hb) {
      const [row] = await db.db.insert(heartbeats).values(hb).returning();
      if (!row) throw new Error('insert returned no row');
      return toHeartbeat(row);
    },

    async listHeartbeats(limit) {
      const rows = await db.db
        .select()
        .from(heartbeats)
        .orderBy(desc(heartbeats.at))
        .limit(Math.min(Math.max(limit, 1), 100));
      return rows.map(toHeartbeat);
    },
  };
}

type Row = typeof heartbeats.$inferSelect;

function toHeartbeat(row: Row): Heartbeat {
  return { id: row.id, service: row.service, status: row.status, at: row.at.toISOString() };
}
