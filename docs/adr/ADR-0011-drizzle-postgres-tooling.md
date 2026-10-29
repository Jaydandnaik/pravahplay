# ADR-0011 — Persistence stack: Drizzle ORM + drizzle-kit migrations, raw-SQL escape hatch

Status: Accepted (Phase 1, 2026-10-29)

## Context
ADR-0002 chose Postgres for everything incl. JSONB, pgvector, FTS, partitions. Repository layer
needs type-safety to TS, migration tooling that can run raw SQL DDL (partitions, extensions,
materialized views), and PgBouncer-friendly behavior (transaction pooling).

## Options
1. **Drizzle ORM + drizzle-kit** (TS-native, SQL-shaped, no runtime ORM magic; `drizzle-kit push`
   for dev, generated SQL migrations for CI; raw SQL passthrough).
2. Prisma — heavier runtime, migration DDL less raw-SQL-friendly (partition DDL is awkward).
3. node-pg-migrate + hand-written repositories — max control, more boilerplate, weaker typing.

## Decision
Option 1. Rules: repository layer per module; no cross-module tables; SQL-style queries for
analytics/partition work; `pg` pool per service + PgBouncer in transaction mode (no session-level
features unless documented); migrations expand→contract (never destructive in a deploy, 10-10).

## Consequences
(+) Type-safe queries with predictable SQL; raw DDL escape hatch for pg_partman/pgvector; small
runtime footprint.
(−) Drizzle's query builder is thinner than Prisma's (team must write more SQL — acceptable for a
staff-engineer posture); ORM updates tracked as supply-chain risk (T15).

## Cost impact / over-limit / fallback
Zero (OSS). Fallback: drop to node-pg-migrate + hand repos if drizzle-kit blocks a needed DDL.
