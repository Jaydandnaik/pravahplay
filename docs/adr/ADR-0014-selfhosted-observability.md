# ADR-0014 — Self-hosted observability stack with hard RAM caps

Status: Accepted (Phase 1, 2026-10-29)

## Context
SLOs (00-03) require metrics/logs/traces/alerts. Grafana Cloud free (10k series, 50 GB logs) is
generous but adds external dependency + egress of telemetry; self-hosted costs RAM (scarce: ADR-0005).

## Options
1. **Self-hosted: Prometheus + Loki + Tempo + Grafana + OTel Collector + Alertmanager→Telegram**,
   each with mem_limit caps and short retention (10-12).
2. Grafana Cloud free — off-VM cost, but telemetry egress + quota ceilings + a vendor in the
   incident path.

## Decision
Option 1 primary (retention 15 d metrics / 7 d logs / 3 d traces, sampling per 10-12), Option 2 as
documented fallback if the VM budget breaks (register row 14). Metrics rules + dashboards as code
in `ops/`. Error tracking: GlitchTip self-hosted (tiny) with Sentry free as fallback.

## Consequences
(+) No telemetry leaves the platform (privacy posture); alert latency local; no quota ceilings.
(−) ~1.5–2 GB RAM spent on observability (budgeted 00-04 §6); single-node self-observability means
"who watches the watcher" — mitigated by external uptime probes (GitHub Actions scheduled workflow
hitting /healthz + play-probe → Telegram) so total VM loss is still visible.

## Cost impact / over-limit / fallback
Zero. Over-limit action: reduce retention/sampling first; evacuate to Grafana Cloud free second.
