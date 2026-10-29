# ADR-0003 — Modular monolith first; split deployables only by ADR

Status: Accepted (Phase 0, 2026-10-29)

## Context
The brief lists ~15 candidate services. The compute reality (ADR-0005: worst case **2 OCPU /
12 GB** after Oracle's 2026 halving of Always Free) cannot run 15 JVM-class or even 15 Node
deployables plus datastores plus observability. The brief itself allows "the minimum number of
deployables that fit the free VM's RAM".

## Options
1. **One modular monolith deployable** (business-domain modules with enforced boundaries) + workers.
2. Microservices from day one.
3. 3–4 grouped deployables (API / media / ads / admin).

## Decision
Option 1, designed to graduate to option 3, then full splits, **only when an ADR justifies it**
(load evidence or team-size change). Enforced module boundaries: each domain module keeps its own
Postgres schema, its own repository layer, no cross-module imports of internals — only shared
package contracts and events. Inter-module communication: in-process calls now, event/Kafka seams
from day one (outbox ADR-0007) so extraction is mechanical, not surgical.

## Consequences
(+) Fits the RAM budget with headroom (see 00-04 §6); one deploy pipeline; simplest failure domain
for a solo operator.
(−) Blast radius: a crash takes all domains down (mitigated by graceful shutdown, health-gated
rollouts, and the degradation ladder); extraction discipline must be enforced in CI (dependency-
cruiser rule per module boundary). Scale ceiling: per-domain scaling impossible until split —
acceptable at lab scale, and the split path is pre-designed.

## Cost impact / over-limit / fallback
Zero cost. Over-limit: none. Fallback: none needed (this is the fallback posture).
