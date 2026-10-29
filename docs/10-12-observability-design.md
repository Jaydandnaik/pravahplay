# 10-12 — Observability Design

PravahPlay · Phase 1 · 2026-10-29 · Self-hosted stack on the free VM (ADR-0014), RAM-capped; the
observability budget is part of the 00-04 §6 table.

## Signals

| Signal | Stack | Scope | Retention (RAM-fit) |
|---|---|---|---|
| Metrics | Prometheus + OTel Collector | RED per endpoint/module; USE per node/pod; business KPIs (CCV, admissions, ad fill, QoE rollups, queue depths, storage budget, backup age) | 15 d (—downsample rules if RAM pressure) |
| Logs | OTel → Loki | structured JSON (pino), trace_id + user/session/request ids; no PII beyond pseudonymous ids | 7 d, sample 10% at info / 100% warn+ |
| Traces | OTel → Tempo | W3C traceparent propagated HTTP→BullMQ→Kafka headers→consumers; sampled 5% baseline, 100% on error + during spikes | 3 d |
| Errors | GlitchTip (self-hosted) | exceptions with release + fingerprint dedup | 30 d |
| Uptime | Prometheus blackbox + synthetic play-probe (token→manifest→segment HEAD loop every 60 s) | playback-path availability SLO source | 30 d |
| Alerts | Alertmanager → Telegram (+ email via Brevo for critical) | SLO burn-rate multiwindow (2%/1h, 5%/6h, 10%/3d) + runbook-linked | — |

## Metric catalogue (headline set; full register in `ops/dashboards/` when created)

- **Playback**: play-probe success %, token issue p95/p99, manifest fetch p95, TTFF (QoE-derived),
  rebuffer ratio, active sessions gauge (Redis-backed).
- **Live**: CCV (HLL estimate + sharded exact), admission queue depth, waiting-room throughput,
  manifest freshness (per cohort), DVR window bytes.
- **Ads**: decision p50/p95/p99, fill rate, fail-open rate (MUST be ~0 except chaos tests),
  beacon ingest rate, decision↔tracker reconciliation drift.
- **Billing**: webhook age, dunning queue, entitlements cache staleness.
- **Platform**: per-module RED, PG (conns, repl lag n/a single node, bloat, partition sizes),
  Redis (ops/s, evictions, memory), Redpanda (in/out rate, consumer lag per group), worker queue
  depth/age per family, VM (CPU steal!, RAM, disk, network) — Oracle reclaim-watch: CPU utilization
  floor (sustained <X% triggers heartbeat job scale-up, per ADR-0005 mitigation).
- **Cost-guard**: R2 storage bytes, Class A/B ops rate (daily extrapolation to quota), Brevo sends
  today/quota, GH Actions minutes month-to-date.

## Dashboards-as-code & alerts (Phase 2 deliverable)

Grafana dashboards provisioned via its HTTP API from `ops/dashboards/*.json` in the repo; Prometheus
rules in `ops/alerts/*.yaml` (loaded by PrometheusRule if using kube-prometheus-stack Helm, else
file-SD). Every alert links its runbook anchor (`ops/runbooks/RB-xx.md`) — an alert without a
runbook link fails CI lint.

## What "observability done" means at the Phase 2 gate

One synthetic play-probe green; RED dashboards per deployable; one burn-rate alert firing to
Telegram (tested with a synthetic error); traces visible across an HTTP→Kafka→consumer path; logs
searchable by trace_id; backup-age metric alerting on miss.
