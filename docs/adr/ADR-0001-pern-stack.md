# ADR-0001 — PERN stack with TypeScript strict

Status: Accepted (Phase 0, 2026-10-29) · Mandated by the brief §2.2; recorded for consequences.

## Context
One language across services, packages and frontends; team of ~1 plus automation; large OTT-pattern
codebase ahead.

## Options
1. **PERN (Postgres, Express, React, Node) + TS strict** — brief-mandated.
2. Java/Scala/Go microservices — closer to what large OTT backends use, but violates the brief and
   multiplies per-service boilerplate for a solo team.

## Decision
Option 1. TypeScript strict everywhere; shared packages (`packages/types`, `config`, `logger`,
`errors`, `auth`, `telemetry`, `ui-kit`) carry cross-cutting code so patterns stay uniform.

## Consequences
(+) One toolchain, one CI, full-stack type sharing; Node streaming primitives fine for API tier.
(−) CPU-bound work (transcode, packaging) must live in workers (FFmpeg processes), never in the
Node event loop; single-process throughput below Go/Java — mitigated by stateless horizontal
scaling and the CDN-first rule (ADR-0004).

## Cost impact / over-limit / fallback
Open-source only — zero cost. Over-limit: none possible. Fallback: none needed.
