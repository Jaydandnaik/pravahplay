# Phase 1 Plan — System Design (no feature code)

- **Status:** IN PROGRESS — started 2026-10-29 after the owner confirmed all defaults ("Continue
  with default"), resolving B-001 (Oracle card approved) and B-002 (public repo approved).
- **Gate:** ends with `docs/10-99-phase-1-gate-report.md` → stop → wait for **APPROVED PHASE 1**.
- **Hard rule:** no feature code. Design docs, contracts, diagrams, ADRs, and three *measured risk
  spikes* (explicitly sanctioned by the brief as small proofs, not product code).

## Deliverables

| # | Document | Contents |
|---|----------|----------|
| 1 | `10-01-c4-architecture.md` | C4 context + container diagrams, bounded contexts, service boundaries, deployable mapping |
| 2 | `10-02-data-models.md` | Per-schema ERDs with indexes, partitioning, retention; cross-schema event seams |
| 3 | `10-03-contracts.md` | OpenAPI contract approach + key endpoint shapes; AsyncAPI event catalogue |
| 4 | `10-04-sequence-flows.md` | Sequence diagrams: login, play, ad break, live join, payment webhook |
| 5 | `10-05-video-pipeline.md` | Ingest → transcode → package → ClearKey → CDN; worker model; failure handling |
| 6 | `10-06-ads-architecture.md` | Decision pipeline, CSAI vs SSAI, cohort stitching, tracker, fail-open |
| 7 | `10-07-live-architecture.md` | Simulated ingest, LL-HLS, DVR, match center, admission control, pre-scale |
| 8 | `10-08-caching-and-consistency.md` | Cache per layer with TTLs/keying; idempotency; outbox/inbox; CQRS read models |
| 9 | `10-09-failure-modes.md` | FMEA-style failure catalogue mapped to the D0–D4 ladder |
| 10 | `10-10-backup-dr.md` | Backup design, restore procedures, DR drill plan, RTO/RPO targets |
| 11 | `10-11-stride-threat-model.md` | STRIDE per container + mitigations mapped to controls |
| 12 | `10-12-observability-design.md` | Metrics/log/trace model, SLO burn alerts, dashboards-as-code plan |
| 13 | `10-13-spike-results.md` | Measured results of the three risk spikes + ADR updates |
| 14 | ADR-0009…0016 | Grow ADR set to 16 (≥15 required) |
| 15 | `10-99-phase-1-gate-report.md` | Gate artifact |

## Risk spikes (measured, on this dev machine)

1. **S1 — SSAI manifest stitching with FFmpeg/HLS**: generate a content rendition + ad creative
   with FFmpeg, package both to HLS, stitch ad pods into content playlists with discontinuity +
   `EXT-X-DATERANGE` via a throwaway script, validate structure, measure stitch latency.
   → proves/disproves cohort-stitching latency budget (ADR-0008).
2. **S2 — Postgres event-table write rate**: dockerized Postgres 16, partitioned event table,
   batched inserts from a Node script at realistic event sizes; measure sustained rows/s and p99
   insert latency. → validates ADR-0007 (partitions before ClickHouse) at lab scale.
3. **S3 — RAM budget of the free-VM topology**: dockerized mini-stack (Postgres, Valkey, Redpanda,
   tiny Node service, Prometheus, Grafana, OTel collector) with production-like memory caps;
   measure idle + loaded RSS totals. → validates the 00-04 §6 budget table against real software.

Method: each spike is a throwaway script + compose file under `spikes/` (committed for
reproducibility, clearly marked non-product). Results recorded with numbers, environment details,
and the honest gap to production scale.

## Exit criteria

1. All documents exist; diagrams render (Mermaid); contracts consistent with ERDs and journeys.
2. Three spikes executed with recorded numbers; ADRs amended where results change decisions.
3. ADR count ≥ 15; every new ADR carries cost impact / over-limit action / fallback.
4. Gate report → stop → **APPROVED PHASE 1**.
