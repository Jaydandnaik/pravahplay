# 00-04 — Capacity Model

Working name: **PravahPlay** · Model date: 2026-10-29 · Status: Phase 0 draft (all figures are
**design-estimates** until Phase 10 load tests label them lab-proven).

Every scale claim in this document carries an evidence class:

- **[PROVEN]** measured in our lab (none yet — Phase 10)
- **[EXTRAPOLATED]** derived linearly from a lab measurement, method documented below
- **[DESIGN-ONLY]** arithmetic from stated assumptions; not yet demonstrated in any lab

## 1. Traffic-unit model (per concurrent viewer)

Assumptions: ABR ladder averages **3 Mbps** per viewer (mix of 360p–1080p, India mobile-heavy);
**6-second CMAF segments**; HLS manifest refresh ~2 s average on live (LL-HLS parts), ~0 on VOD
after initial load; playback heartbeat every 30 s; QoE telemetry batched ≈ 1 event / 30 s;
match-center poll with jittered cache-friendly intervals averaging 8 s (SSE/WebSocket for engaged
users; CDN-cached JSON polling fallback).

| Unit (per viewer) | Live | VOD |
|---|---|---|
| Bandwidth | 3 Mbps ≈ 0.375 MB/s | 3 Mbps |
| Segment fetches | 0.167 req/s (1 per 6 s) | 0.167 req/s |
| Manifest fetches | ~0.5 req/s (LL-HLS parts) | ~0.02 req/s (loads/seeks only) |
| Playback heartbeats (API) | 0.033 req/s | 0.033 req/s |
| Match-center / rail refresh | 0.125 req/s (cache-friendly) | — |
| QoE telemetry events (ingest) | 0.033 ev/s | 0.033 ev/s |

## 2. Edge tier (CDN) — where video bytes terminate

| Metric @ CCV | 10k | 100k | 1M | 10M |
|---|---|---|---|---|
| Egress bandwidth | 30 Gbps | 300 Gbps | 3 Tbps | 30 Tbps |
| Segment requests/s (edge) | 1.7k | 16.7k | 166.7k | 1.67M |
| Manifest requests/s (edge, live) | 5k | 50k | 500k | 5M |

[DESIGN-ONLY] — arithmetic from §1. At 10M CCV a single region cannot absorb this; the design is
multi-CDN / multi-region sharded by channel and audience (see §8).

## 3. Origin tier (after CDN cache)

Cacheability assumptions: segments **cacheable ≥ 99.9%** at ≥100k CCV (popular-segment
concentration), 99% at ≤10k; SSAI live manifests cacheable **per stitching cohort** with 1–2 s TTL
(≥ 90% edge absorption); tokenized per-user playback manifests are **never** edge-cached.

| Service (requests/s reaching origin) | 10k | 100k | 1M | 10M |
|---|---|---|---|---|
| Playback: token + entitlement (per-user, uncacheable) | ~5 steady / **167 join-spike** | ~50 / **1,667** | ~500 / **16,667** | ×10 |
| Auth session checks (Redis-backed, spill to PG replica) | ~80 / 833 spike | ~800 / 8.3k | ~8k / 83k | ×10 |
| Catalog/discovery rails (edge-cached per audience segment, 95% hit) | ~40 | ~400 | ~4k | ~40k |
| Manifest service (live, cohort-cacheable, 90% hit) | ~500 | ~5k | ~50k | ~500k |
| Ads-decision (cacheable per cohort × break-slot, 2 s TTL) | ~8 | ~80 | ~800 | ~8k |
| Ads-tracker beacons (uncacheable ingest, break bursts) | ~75 | ~750 | ~7.5k | ~75k |
| Analytics collector (batched QoE) | ~330 ev/s | ~3.3k | ~33k | ~330k |

**Join-spike** = everyone arrives in 60 s (match start). Steady = mid-match. [DESIGN-ONLY]
The uncacheable token path at join is the single hardest origin load — this is exactly what the
waiting room / admission control sheds (Phase 8): excess joiners queue instead of hammering origin.

## 4. Data stores

| Store | 10k CCV | 100k | 1M | Notes |
|---|---|---|---|---|
| Postgres conns (via PgBouncer txn mode) | 25–40 | 40–60 | 60–100 | Heartbeats land in Redis, flush-batched to PG every 5 s; reads hit replica |
| Postgres writes/s (batched) | ~15 | ~120 | ~1.2k | Partitioned event tables via pg_partman |
| Redis ops/s | ~600 | ~6k | ~60k | Sessions, rate limits, HLL concurrency, trending ZSETs |
| Kafka msg/s (all topics) | ~1.5k | ~15k | ~150k peak | heartbeats + QoE + ad events + outbox; Redpanda single-node class ~100k+/s on commodity hardware [DESIGN-ONLY] |
| ClickHouse inserts | deferred | deferred | ~5k rows/s batched | On the free VM, ad events go to Postgres partitions first (ADR-0007) |

## 5. Media storage budget vs R2 free tier

R2 free (verified 2026-10-29, see COST_REGISTER): **10 GB storage, 1M Class A ops/mo,
10M Class B ops/mo, zero egress fees**.

Packaged ladder ≈ 4.3 GB per content-hour (360p 0.8 + 480p 1.2 + 720p 2.5 + 1080p 4.5 Mbps + audio
+ sprites + subs). Therefore **10 GB ≈ 2.3 hours of full-ladder content** — the demo catalog must
be curated, not bulk:

| Bucket | Budget |
|---|---|
| 3 flagship titles, full ladder (~30 min each) | ~6.5 GB |
| 8 secondary titles, 480p-only (~12 min each) | ~0.8 GB |
| Live loop: 2 renditions × 30-min DVR window (rotated) | ~1.6 GB |
| Thumbnails/sprites/subs | ~0.4 GB |
| WAL archives (WAL-G) | ~0.3 GB |
| Headroom | ~0.4 GB |
| **Total** | **≈ 10.0 GB — at the limit; uploads gated by a storage-budget job** |

Class B ceiling (origin reads after CDN): budget 10M/mo ≈ **3.85 origin req/s sustained**. At
0.167 seg-req/s/viewer that supports ≈ **2,300 sustained CCV at 99% cache hit, 23,000 at 99.9%**.
Our live scale target (tens of concurrent viewers) uses <1% of this. [DESIGN-ONLY]

## 6. Production compute budget (Oracle Always Free)

**Critical 2026 finding:** Oracle halved Always Free ARM for new tenancies to **2 OCPU / 12 GB**
(InfoQ Jul-2026; official docs still cite the old 4 OCPU / 24 GB allowance — see COST_REGISTER row
5). **We design for 2/12 worst case; 4/24 is upside**, not a dependency.

| Component | 2/12 worst case | 4/24 upside |
|---|---|---|
| OS + k3s system | 1.2 GB | 1.2 GB |
| Postgres (+PgBouncer) | 1.5 GB | 2.0 GB (+read replica 1 GB) |
| Redis/Valkey | 0.4 GB | 0.6 GB |
| Redpanda (heap-capped) | 1.0 GB | 1.5 GB |
| App tier: modular monolith (gateway + all business services) | 1.6 GB | 3.0 GB (split 2–3 deployables) |
| Observability (Prom, Grafana, Loki, OTel) | 1.6 GB | 2.0 GB |
| Argo CD + agents | 0.4 GB | 0.5 GB |
| Live sim (MediaMTX + FFmpeg packager) | 0.8 GB | 1.2 GB |
| ClickHouse | **deferred** (PG partitions) | 2.0 GB |
| Headroom | ~3.5 GB | ~11 GB |
| **Total** | ~12 GB — fits, tight | ~24 GB — comfortable |

This table is the quantitative justification for ADR-0003 (modular monolith first) and ADR-0007
(Postgres partitions before ClickHouse). Single-node k3s = no HA at this tier; HA is a funded-scale
change documented in the scale-up runbook (Phase 10).

## 7. What 1M CCV would cost when funded [DESIGN-ONLY]

- Egress: 3 Tbps sustained = 1.35M GB/hour → **$6.7k/h at $0.005/GB** list ≈ $4.9M/mo continuous;
  at a realistic match duty cycle (~15% monthly average of peak) ≈ **$0.7–1M/mo**, less with
  multi-CDN negotiation and peering (incumbents pay far below list).
- Origin compute for the uncacheable token path at 16.7k joins/s: ~40–60 small stateless pods
  across 3 regions + admission control.
- CDN hit ratio 99.9% required to keep origin egress under ~3 Gbps aggregate.
- Purpose of this row: honesty about the gap, and the seed of the Phase 10 scale-up runbook.

## 8. Lab-scale evidence plan (Phase 10, method locked now)

1. k6 progression: 100 → 500 → 1k → 5k VU against the staging cluster for: play-token issue,
   heartbeat, rails, ad decision, tracker ingest, segment proxy simulation (cache-warmed).
2. Measure per-service: RPS, p50/p95/p99, CPU/RAM, PG conns, Redis ops, Kafka lag.
3. Derive **per-1,000-viewer cost** per service; extrapolate linearly; state nonlinear risks
   (GC pauses, conn-pool saturation, context switching) explicitly.
4. Spike test: 0 → 5k VU in 60 s against admission control; measure shed/queue rates.
5. Everything measured gets [PROVEN]; everything scaled gets [EXTRAPOLATED]; nothing at ≥100k is
   ever called proven.

## 9. Stated gaps (honesty section)

- Zero measurements exist yet; every number above is [DESIGN-ONLY] until Phase 10.
- 10M CCV assumes multi-region sharding not yet designed in detail (Phase 1 diagrams cover the
  pattern; per-region math is linear from 1M).
- Cache-hit ratios (99/99.9%) are industry-typical assumptions, not ours to claim until measured.
- The R2 10 GB cap forces a curated demo catalog — full catalog breadth is a funded-scale luxury.
- Oracle 2/12 vs 4/24 is unresolved at signup time; the design binds to the worst case.
