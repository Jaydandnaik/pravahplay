# 20-99 — Phase 2 Gate Report

PravahPlay · 2026-10-29/11-01 · **Status: PHASE 2 LOCALLY COMPLETE — production deployment is
OWNER-BLOCKED. Stopped at gate; see "Owner actions required".**

## What was built (commit range `56147e1..faec8c6` in C:\dev\pravahplay)

| Deliverable | Evidence |
|---|---|
| pnpm + Turborepo monorepo, shared packages (types, config, errors, logger, telemetry) | `pnpm build` **9/9 tasks green**; `pnpm test` green (5 API tests incl. ProblemDetails + validation) |
| Walking skeleton API (Express TS, layered module: routes→service→repository) | `/healthz` `{"status":"ok"}` · `/readyz` (DB check) · `/metrics` (RED histogram by method/route/status) · `POST/GET /v1/system/heartbeats` — **row persisted to Postgres verified via psql (`count=1`)** |
| Drizzle migration (ADR-0011) | `drizzle/0000_*.sql` applied; `heartbeats` table present |
| Web app (Vite + React, brand-styled) | builds (69 KB gz); calls `/healthz` via dev proxy |
| Dev compose stack | Postgres 16, Valkey, Redpanda, Prometheus, Grafana, Tempo, Loki, OTel Collector — all Up |
| Observability verified end-to-end | **Prometheus scraping API (target health: up)**; **Tempo returns real `pravah-api` traces** (OTLP → collector → Tempo); Loki v3 up (schema fix) |
| Helm chart + k3d config | `infra/helm/pravah` (Deployment/Service/StatefulSet/probes/annotations) — not yet exercised (see gaps) |
| CI pipeline | `.github/workflows/ci.yml`: lint→typecheck→build→test→Trivy (fail HIGH/CRITICAL)→Syft SBOM→GHCR push→gitleaks |
| IaC skeletons + secrets posture | `infra/tofu` (Always-Free-shape guard comment), `infra/ansible` (k3s playbook), `secrets/README.md` |
| Ops starters | alerts (`ApiDown`, `ApiHighErrorRate`, `BackupAge` — all runbook-linked), Grafana dashboard JSON, `RB-01` runbook |

## Verification evidence (all commands re-runnable from the repo)

1. `pnpm build && pnpm test` → 9/9 green, 5/5 tests pass.
2. `docker compose -f infra/compose.dev.yaml up -d` → 8/8 containers Up.
3. `curl :8090/healthz` → `{"status":"ok","service":"pravah-api"}`.
4. `curl :8090/readyz` → `{"status":"ready"}` (live DB round-trip).
5. `POST /v1/system/heartbeats` → 201 with UUID; `docker exec … SELECT count(*)` → 1.
6. `curl :9090/api/v1/targets` → `pravah-api … health: up`.
7. `curl :3200/api/search?tags=service.name=pravah-api` → real trace IDs.

## Deviations & honest gaps

1. **Machine-local port shadows**: this dev PC has services on 5432 and 8080 (8080 answers as
   Jenkins). Dev topology moved to **5434/8090** (committed); production ports unaffected
   (container-internal). Recorded in ASSUMPTIONS A-009.
2. **First-attempt failures, honestly logged**: Loki needed two config fixes (Loki 3.x requires
   explicit `schema_config`; retention requires object storage — deferred to production config).
   Postgres needed a volume reset + port move after host-path auth weirdness. Both fixed and
   committed.
3. **App-side OTLP log export not yet wired** (collector→Loki pipeline exists; pino→OTLP transport
   lands with Phase 3 auth module). Traces already flow.
4. **k3d + helm rollback drill not yet run** — helm/k3d binaries are not installed on this machine;
   scheduled as the first local item after owner actions (below).
5. **Production deploy blocked on owner** (below). The Phase 2 exit criterion "deployed to
   production by merging to main" cannot be met until then — stated plainly, not papered over.

## Owner actions required (blocking production)

1. **Create the GitHub repository** (B-002 approved: public). `gh` CLI is not installed on this
   machine; either install GitHub CLI and `gh auth login`, or create `pravahplay` (empty, no
   README) in the browser and tell me the remote URL — I'll push and open the first PR.
2. **Oracle Cloud signup** (B-001 approved: Always Free only): needs your card + browser at
   cloud.oracle.com. Then: note the tenancy OCID/region; I drive tofu/ansible from there.

## Cost register status

No new external services used this phase (all local OSS). Register unchanged; next ritual
re-verification at production provisioning (Cloudflare + GHCR terms re-reads are queued actions).

## Proposed next steps once unblocked

Install helm+k3d → image build → k3d deploy → **rollback drill** (exit criterion) → push to GitHub
→ CI green → Oracle VM → k3s + Argo → staging→production deploy of the walking skeleton →
**APPROVED PHASE 2** → Phase 3 (identity, accounts, profiles).

**Work is stopped here per the working agreement.**
