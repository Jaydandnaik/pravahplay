# 10-09 — Failure Modes & Degradation Mapping (FMEA)

PravahPlay · Phase 1 · 2026-10-29 · Ladder D0–D4 defined in 00-03; this maps component failures to
behavior, detection, and automated/manual response. "Playback must continue" is the design law.

| # | Component | Failure mode | Effect | Detection | Automated response | Manual/ops |
|---|---|---|---|---|---|---|
| F1 | pravah-api pod crash | 502s on API | browse + playback token down | probes, RED alerts | k3s restart; readiness gate; rollback via Argo | runbook RB-01; scale if OOM |
| F2 | Postgres down | all stateful ops fail | no browse/personalize; **playback of admitted viewers continues (cached manifests/segments)** | probes; error-rate alert | circuit breakers open; static fallback rails (D4-lite); restart + PITR restore if needed | RB-02: restore drill (10-10) |
| F3 | Redis loss | sessions + caches gone | users re-auth; queues at risk | probe; BullMQ stalled-job events | cache cold-start (origin absorbs ~×3 for minutes — shed non-critical per D1); BullMQ restartable from snapshots + idempotent jobs | RB-03 |
| F4 | Redpanda down | events stop flowing | discovery/analytics stale; outbox buffers in PG | consumer lag alert; relay retry | outbox accumulates (bounded, 1M rows cap w/ alert); consumers catch up on recovery | RB-04; if RAM, swap to Redis Streams fallback (ADR-0007) |
| F5 | Ads decision timeout/500 | no ads returned | **playback continues ad-free (fail-open law)** | decision p99 alert; fill-rate drop | circuit breaker per campaign source; global `ads.enabled` flag | ad-ops console kill switch |
| F6 | SSAI stitcher failure | stale cohort manifests | viewers keep last manifest; new joins may get un-stitched content | manifest freshness metric | fail-open: serve content-only manifest; ads disabled flag | ops console |
| F7 | R2/CDN partial outage | some segments 4xx/5xx | rebuffer/skip | QoE error spike, CDN analytics | player ABR downshift + retry-with-jitter; B2 fallback origin (ADR-0004) switch (manual, rehearsed) | RB-05: B2 cutover |
| F8 | Transcode worker OOM/slow | media jobs back up | catalog updates delayed | queue depth alert | job retry, ladder downgrade (720p cap), concurrency 1 | ops flag |
| F9 | Live sim failure | stream stalls | live event frozen | manifest freshness + CCV drop | auto-restart sim; event state flag; viewer message | RB-06 |
| F10 | Brevo quota/credits | OTP emails stop | signup/login blocked | 70% quota alert; provider 4xx | queue + drain; UI clear retry messaging; console-OTP dev mode (disclosed) with explicit admin flag | switch Resend fallback |
| F11 | Payment webhook storm / provider outage | billing events delayed | subscriptions lag truth | webhook age alert | idempotent replay; polling reconciliation job (provider API, test mode) | finance runbook |
| F12 | Token-path saturation (join spike) | token p99 breach | new joins slow | burn-rate alert (SLO) | D2: waiting room auto-engage; admit at budget rate | pre-scale runbook |
| F13 | Origin egress spike / cache-hit collapse | origin overwhelmed | everything slows | CDN hit-ratio alert | D3: bitrate cap cohort manifests; telemetry sampling down | CDN config review |
| F14 | Secret/credential exposure | potential compromise | — | gitleaks CI, audit anomalies | rotate (age keys, JWT secret, provider keys); revoke sessions | IR runbook RB-07 |
| F15 | Node OOM (monolith module leak) | pod restarts | intermittent 5xx | memory RSS alert at 80% | k8s limits + restart; module isolation via feature flag disable | heap snapshot; split module (ADR-0003 path) |

Cross-cutting: every external call has timeout + retry budget + circuit breaker (opossum);
bulkheads = separate BullMQ queues + worker concurrency caps per family (media, notify, rollup);
graceful shutdown drains SSE + finishes jobs; readiness vs liveness split (dep ≠ ready during
cache warm).

Chaos experiments (Phase 10) rehearse F2, F3, F4, F5, F7, F12 explicitly, with acceptance
criteria = "playback of admitted viewers continued; ladder engaged within 60 s".
