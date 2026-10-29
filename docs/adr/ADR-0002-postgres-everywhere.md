# ADR-0002 — Postgres as the only system of record

Status: Accepted (Phase 0, 2026-10-29)

## Context
The brief mandates Postgres instead of MongoDB, with JSONB where schema is flexible. The platform
needs relational integrity (accounts, entitlements, campaigns), flexible fields (metadata, target
rules), similarity search (recommendations), text search (catalog), and high-volume append
(events), on a 12–24 GB RAM VM.

## Options
1. **Postgres for everything** with JSONB, pgvector, FTS + pg_trgm, pg_partman.
2. Postgres + MongoDB + Elasticsearch + a dedicated vector DB — one engine per access pattern.

## Decision
Option 1. One engine, one backup story, one HA story at funded scale. Schema rules: relational
columns wherever a relationship or constraint exists; JSONB only for genuinely flexible payloads
(ad targeting rules, per-title metadata extensions); pgvector for embeddings; FTS+trgm for search
(revisit Meilisearch only if relevance demonstrably fails); event tables partitioned monthly via
pg_partman.

## Consequences
(+) Operational simplicity and zero license cost; JSONB keeps flexibility; extensions cover 90% of
specialized-engine needs at our scale.
(−) Not best-of-breed per access pattern; pgvector/search performance ceilings exist — revisit at
funded scale with real data. Vacuum/partition maintenance is now ours (automated jobs + Phase 10
tuning).

## Cost impact / over-limit / fallback
Self-hosted OSS — zero. Over-limit: storage on the VM is bounded (block volume free tier); action =
aggressive retention policies + WAL/archive to R2. Fallback (staging): Neon free (0.5 GB) or
Supabase free (500 MB) — verified 2026-10-29 in COST_REGISTER.
