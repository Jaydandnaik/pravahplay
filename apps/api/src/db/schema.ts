import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** Walking-skeleton table: proves DB round-trips, migrations and repository layering. */
export const heartbeats = pgTable('heartbeats', {
  id: uuid('id').primaryKey().defaultRandom(),
  service: text('service').notNull(),
  status: text('status').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>(),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
});

export type HeartbeatRow = typeof heartbeats.$inferSelect;
export type NewHeartbeat = typeof heartbeats.$inferInsert;
