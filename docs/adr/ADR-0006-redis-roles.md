# ADR-0006 — Self-hosted Redis (Valkey) with enumerated roles

Status: Accepted (Phase 0, 2026-10-29)

## Context
Multiple needs: response caching, session store, rate limiters, queues (BullMQ), trending sorted
sets, HyperLogLog concurrency counting, pub/sub fan-out. Verified 2026-10-29: Upstash free tier is
only 256 MB / 500K commands/mo / 10 GB bandwidth — too small to be primary for a platform with
~60k ops/s at 1M CCV design load.

## Options
1. **Self-hosted Redis (Valkey) on the VM**, capped memory + eviction policy per logical DB.
2. Upstash as primary.
3. No Redis — Postgres for everything (reject: latency + connection pressure).

## Decision
Option 1. Roles enumerated (each with TTL and eviction class): sessions (volatile-ttl), API
response cache (allkeys-lru), rate-limit counters (volatile-ttl), BullMQ queues (noevict),
trending ZSETs (noevict, size-capped), HLL registers (noevict, small), pub/sub (ephemeral).
Keyspace conventions documented in `packages/config`. Eviction must never hit queues (noevict DBs).

## Consequences
(+) Single-digit-ms reads; absorbs heartbeat/session load off Postgres (ADR-0002).
(−) Redis loss = session/cache loss (accepted: users re-auth; queues persist via BullMQ Redis-
snapshot config + job idempotency); memory pressure on the VM budget (capped ~400–600 MB, 00-04 §6).

## Cost impact / over-limit / fallback
Zero. Over-limit: Redis RAM cap alert at 80%; action = TTL tuning + LRU tightening. Fallback:
Upstash free (256 MB / 500K cmd/mo) for *session+rate-limit only* in an evacuation; queues would
move to Postgres-based processing (documented in the runbook).
