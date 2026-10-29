# ADR-0013 — Testing strategy and coverage gates

Status: Accepted (Phase 1, 2026-10-29)

## Decision (levels and tools)

| Level | Tool | Scope | Gate |
|---|---|---|---|
| Unit | Vitest | domain logic per module | ≥80% lines on `modules/*/domain+service` |
| Contract | Pact | module↔module public-api seams + provider verification in CI | no unresolved diffs |
| Integration | Testcontainers (dockerized PG/Valkey/Redpanda) | repositories, outbox relay, migrations | suite green per PR |
| E2E | Playwright | the five flows in 10-04 + kids gating + paywall | green per gate |
| Load | k6 | `ops/load/*` suites (browse, token, heartbeat, ad decision, tracker) | results committed at gates |
| Chaos | k6 + kubectl delete / Toxiproxy | F2–F7, F12 scenarios (10-09) | acceptance: playback continues; ladder ≤60 s |

## Consequences
(+) Tests mirror production topology via Testcontainers; contracts keep monolith module boundaries
honest (enforces ADR-0003); Playwright flows are executable versions of 10-04.
(−) CI wall-clock grows; mitigated by Turborepo caching and sharded jobs. Pact broker is
self-hosted-lite (pacts stored as artifacts in GH, verified in CI) — no paid broker.

## Cost impact / over-limit / fallback
All OSS; Testcontainers needs Docker in CI — GitHub-hosted runners provide it free on public repos.
Fallback: Locust for load if k6 scripting limits hit.
