# ADR-0012 — Monorepo tooling: pnpm + Turborepo

Status: Accepted (Phase 1, 2026-10-29)

## Context
Brief §2 mandates pnpm + Turborepo. Workspaces: `apps/web|admin|advertiser`, `apps/api` (monolith
+ worker entries), `packages/*` (types, config, logger, errors, auth, telemetry, ui-kit, api-spec).

## Decision
pnpm workspaces (content-addressed store, strict node_modules) + Turborepo task graph
(`lint/test/build` cached; remote cache disabled — no paid Vercel service; local cache only).
Turborepo provides topological task ordering so worker/api builds share packages deterministically.

## Consequences
(+) Fast installs, dependency-hoisting safety, one CI graph; matches brief.
(−) Turborepo adds build-graph complexity for marginal gain at this size — kept because brief
mandates and CI minute-budgets benefit from caching (GitHub Actions minutes are free for public
repos, but wall-clock time gates deploys).

## Cost impact / over-limit / fallback
Zero. Fallback: plain pnpm scripts if Turborepo misbehaves (reversible).
