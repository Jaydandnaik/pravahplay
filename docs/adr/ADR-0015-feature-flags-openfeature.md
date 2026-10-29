# ADR-0015 — Feature flags: OpenFeature SDK + Postgres/Redis-backed provider

Status: Accepted (Phase 1, 2026-10-29)

## Context
Degradation ladder (D1–D4), ad kill switch, per-cohort experiments, and Phase 9 A/B testing all
need flags. Unleash OSS is capable but is a RAM-hungry extra deployable at the worst-case budget.

## Options
1. **OpenFeature SDK (vendor-neutral) + small custom provider** reading flags from Postgres
   (`admin.flags`, audit-logged) with a 5 s in-process refresh + Redis pub/sub invalidation.
2. Unleash OSS self-hosted — full UI, more RAM + one more deployable to operate.

## Decision
Option 1 now; Unleash stays the documented upgrade path when team/ops scale justifies its RAM.
Flag change = admin API (RBAC, audit) → pub/sub bust → all pods refresh ≤5 s. Flag evaluation is
local (no hop in hot paths); every flag defaults safe (ads ON → fail-open; ladder OFF).

## Consequences
(+) Near-zero RAM/latency; vendor-neutral API keeps Unleash/Flagsmith swappable.
(−) No fancy UI (admin console builds minimal flag CRUD — acceptable; flags are few and
high-leverage, not thousands).

## Cost impact / over-limit / fallback
Zero. Fallback: env-var static flags (the emergency posture) — always supported by the same SDK.
