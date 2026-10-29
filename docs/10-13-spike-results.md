# 10-13 — Risk Spike Results (measured)

PravahPlay · Phase 1 · 2026-10-29 · Environment: dev PC — i5-12450H (8C/12T), 15.7 GB RAM, Docker
29.1.3 (WSL2, ~8 GB to Linux VM), Windows 11, FFmpeg 8.x static (gyan release-essentials),
Postgres 16-alpine. Spikes are throwaway-but-committed reproducibles under `spikes/`; NOT product
code. All numbers below are **[PROVEN at lab scale]** with derating notes; production ARM VM will
be slower — derating assumptions stated per spike.

## S1 — SSAI manifest stitching with FFmpeg/HLS  → validates ADR-0008

Method: generated 60 s content (testsrc2, 720p25, H.264, AAC, 6 s fMP4 segments) and a 10 s ad
(smptebars, identical codec/params = rendition conditioning), packaged both to CMAF HLS; a Node
stitcher (spikes/s1/s1-stitch.js) inserts the pod at t=12 s with `EXT-X-DISCONTINUITY` +
`EXT-X-DATERANGE` (SCTE35-OUT placeholder) + per-source `EXT-X-MAP`.

| Measurement | Result |
|---|---|
| Stitch latency (1000 iterations, in-process) | **avg 0.007 ms · p50 0.004 ms · p99 0.050 ms · max 0.59 ms** |
| Stitched playlist validity | ffprobe parses; duration **exactly 70.000 s** (60+10) |
| Decode integrity | full decode of all 1750 video frames across discontinuity — **0 errors** |

Findings: (1) stitching is string-manipulation-cheap — even with manifest fetch + cache write I/O,
the p99 50 ms ad-decision budget is not threatened by stitch cost; (2) fMP4 requires careful
`EXT-X-MAP` handling per source (the spike's first two iterations failed exactly here — content
init must be emitted at playlist head, ad init after discontinuity); (3) DATERANGE with
SCTE35-OUT + CUE-OUT/CUE-IN coexist fine under ffprobe.

Derating: production adds Redis/PG reads and CDN publish (async) — stitch remains µs-class;
cohort-manifest publish path is the real cost and is amortized (2 s TTL, not per-request).
**ADR-0008 cohort approach: validated, no change needed.**

## S2 — Postgres event-table write rate  → validates ADR-0007

Method: dockerized Postgres 16 (shared_buffers 256 MB, wal_compression on, synchronous_commit off
— ingest mode, checkpoint_timeout 15 min), daily-range-partitioned `events` table, ~500 B JSONB
payloads (10-02 sizing), 8 workers × 250-row single-txn batch inserts for 60 s (spikes/s2).

| Measurement | Result |
|---|---|
| Sustained throughput | **4,136,750 rows in 60 s = 68,946 rows/s** |
| Batch latency (250-row txn) | p50 14.1 ms · p95 77.4 ms · p99 252.3 ms · max 1,034 ms |

Findings vs design targets (00-04 §4): 1M CCV estimated ~1.2k PG writes/s after batch+dedup — the
lab box sustains **~57× that**; even a 10× ARM/VM derating leaves ~5.7× headroom. At the
*production* 2 OCPU/12 GB worst case, expecting roughly a third of this throughput still leaves
multi-year-headroom for Phase 0 targets. Honest caveats: synchronous_commit=off (production
flushes heartbeats every 5 s — a bounded-loss window, documented in 10-02/10-08); no concurrent
read load in this spike; partition count small.
**ADR-0007 "Postgres partitions before ClickHouse": validated — ClickHouse stays deferred.**

## S3 — RAM budget of the free-VM topology  → validates ADR-0005 + 00-04 §6

Method: dockerized mini-stack with production-shaped memory caps (spikes/s3/compose.yaml):
Postgres 16 (1.5 Gi cap), Valkey 8 (300 MB maxmemory), Redpanda single-node (700 M heap cap),
Node service, Prometheus 15 d retention, Grafana, OTel Collector; 60 s warmup; `docker stats`.

| Component | Measured idle RSS | Production-shaped estimate |
|---|---|---|
| Postgres | 38 MiB (loaded ref from S2 run: **481 MiB**) | 1.0–1.5 GB (shared_buffers + conns + bloat) |
| Valkey | 3 MiB | ≤300 MB (maxmemory cap) |
| Redpanda | 171 MiB | ≤700 MB (hard heap cap) |
| Node (trivial service) | 9 MiB | 400–800 MB (real monolith; honest unknown until Phase 2) |
| Prometheus | 17 MiB (fresh) | 200–400 MB at our series count over 15 d |
| Grafana | 76 MiB | 150–250 MB |
| OTel Collector | 34 MiB | 100–150 MB |
| **Sum (measured idle)** | **~349 MiB** | **~2.9–4.1 GB projected** |

Plus components not in this spike (honest additions): k3s system + agents ~0.8–1.2 GB, OS ~0.5 GB,
transcode Jobs transient 2 Gi (1 concurrent). **Projected total ≈ 4.2–5.8 GB vs the 12 GB
worst-case budget — fits with ~6 GB headroom.** The 00-04 §6 table holds; no ADR changes needed.
Caveat: 8 GB Docker VM limits how far we can push load tests locally; Phase 10 will size PG's
under-load memory on the real VM.

## Spike-driven ADR changes

None required — all three spikes **validated** existing decisions (0005, 0007, 0008). Two
operational notes carried forward: (a) the stitcher's fMP4 EXT-X-MAP handling becomes a Phase 7B
unit-test fixture; (b) `synchronous_commit` policy for event tables (bounded-loss ingest) is
explicitly documented in 10-02 and must be reflected in the migration DDL.
