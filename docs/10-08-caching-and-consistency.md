# 10-08 — Caching Strategy, Consistency & Idempotency

PravahPlay · Phase 1 · 2026-10-29

## Cache per layer

| Layer | What | Key / TTL | Invalidation |
|---|---|---|---|
| Browser | static app shell, fonts, player lib | hashed filenames, immutable | content-hash deploys |
| CDN (Cloudflare) | rails/kids/sports JSON per audience segment; title pages; SSRAI cohort manifests (2 s); catalog images | `cache:{module}:{segmentKey}` pattern; 60–300 s; manifests 2 s | purge on publish; short TTL elsewhere |
| API in-process | ads decision index; entitlement mini-cache (per user, 60 s); catalog title LRU | module-local LRU | index rebuild timer; event-driven bust |
| Redis | sessions, rate limits, rails snapshot per segment, trending ZSETs, HLL counters, freq caps | per ADR-0006 DBs | event-driven + TTL |
| Postgres | — (source of truth; read replica at funded scale) | — | — |

**Edge keying rule**: anonymous/segment-keyed GETs are CDN-cacheable with `Vary: X-Segment` (or
query param), so 95%+ of browse traffic never reaches origin (00-04 §3). Personalized rails mark
their edge-cacheability class explicitly in the rail config (`edge: public|segment|private`).

## Consistency model

- **Strong** (PG txn): money (billing), entitlements, concurrency counters' authoritative fallback,
  CMS publish workflow, ad campaign state.
- **Read-your-writes** (session-affinity via `user`-keyed cache bust + short TTL): profile edits,
  watchlist, watch progress.
- **Eventual** (outbox → Kafka → read models, seconds): discovery rails, trending, co-watch,
  analytics rollups, match-center history.
- Write-heavy paths are batched (heartbeats 5 s flush) — no interactive write needs >1 s freshness
  except entitlements (cached 60 s max; revocation uses Redis denylist for immediate effect).

## Idempotency & exactly-once illusions

- Unsafe POSTs take `Idempotency-Key`: server stores (key, request-hash, response) 24 h in PG
  (`idempotency_keys` per schema as needed); replay returns stored response; hash mismatch → 409.
- Outbox/inbox (ADR-0007): at-least-once delivery + `eventId` dedup = effectively-once consumers.
- Payment webhooks dedup on provider event id (10-04). Beacon dedup on beacon_id (10-06).
- Ad decisions idempotent per (requestId): reprocessing a request log replays decisions without
  re-charging budgets (pacing corrections are computed from decision logs, not beacons alone).

## CQRS read models

| Read model | Source events | Rebuild strategy |
|---|---|---|
| `discovery.search_titles` | catalog.events | materialized view refresh on publish |
| rails snapshots (Redis + CDN) | catalog.events, playback.events (trending) | hourly + on publish; full rebuild job |
| `co_watch_pairs`, `title_embeddings` | playback.progress batch | nightly job; pgvector index |
| `analytics.*` rollups | analytics.events, ad.events | stream consumer (1 min micro-batch) + nightly reconcile |
| `audience_daily` (DAU/MAU) | session starts | daily HLL→PG snapshot |

All read models are rebuildable from source events/partitioned tables — their loss is never fatal.

## Clock, jitter, and ordering rules

- All timestamps `timestamptz` UTC; IST only at presentation.
- Retries: exponential backoff + full jitter; budgets: 2 attempts inline, rest async.
- Ordering: per-entity via Kafka key (user/title/beacon); global ordering never assumed.
- Scheduled work uses DB-backed schedulers (pg-boss/BullMQ repeatables), never in-memory timers,
  so restarts are safe.
