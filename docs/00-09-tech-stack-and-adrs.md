# 00-09 — Final Tech Stack and ADR Index

Working name: **PravahPlay** · Phase 0 · 2026-10-29

## Stack summary (each row decided in an ADR below)

| Concern | Choice | Fallback (free) |
|---|---|---|
| Language/runtime | TypeScript (strict) everywhere; Node.js LTS for services | — |
| Data model / system of record | PostgreSQL 16 (JSONB for flexible schema, pgvector, FTS + pg_trgm, pg_partman) | — |
| Services | Express on Node, modular monolith first, split by ADR | — |
| Frontends | React + Vite (web PWA, admin CMS, advertiser portal) | — |
| Cache / queues / sessions | Redis (Valkey) self-hosted; BullMQ | Upstash (256 MB, 500K cmd/mo — verified) |
| Event backbone | Redpanda (KRaft, single node) + Postgres outbox | NATS JetStream / Redis Streams |
| Analytics store | Postgres partitions first; ClickHouse OSS when event volume justifies RAM | — |
| Media storage/egress | Cloudflare R2 (10 GB free, zero egress) behind Cloudflare CDN | Backblaze B2 (10 GB + Bandwidth Alliance) |
| Live simulation | MediaMTX + FFmpeg → LL-HLS/DASH | — |
| Packaging | FFmpeg per-title ladder → CMAF (HLS+DASH) via Shaka Packager | — |
| DRM | ClearKey (open test keys) + signed URLs | — (Widevine et al. are paid — out of scope) |
| Production compute | Oracle Always Free ARM k3s — **designed for 2 OCPU/12 GB worst case** | Koyeb/Render free (cold starts), home server + Tunnel |
| Frontend hosting | Cloudflare Pages (500 builds/mo, unlimited bandwidth) | Netlify (100 GB/mo), GitHub Pages |
| CI/CD | GitHub Actions (public repo = free minutes) + GHCR | GitLab CI |
| GitOps/IaC | Helm + Argo CD; OpenTofu + Ansible | Flux |
| Secrets | SOPS + age | Doppler free |
| Observability | Prometheus, Grafana, Loki, Tempo, OTel Collector, Alertmanager→Telegram | Grafana Cloud free (10k series, 50 GB logs) |
| Errors | GlitchTip self-hosted | Sentry free (5k err/mo, 1 user) |
| Email/OTP | Brevo (300/day verified) | Resend free; console provider in dev |
| Push | Web Push VAPID + FCM (free, ~100k msg/day) | — |
| Payments | Razorpay/Stripe TEST MODE | mock gateway (built in-house) |
| Load testing | k6 OSS | Locust |

## ADR index (Phase 0 seeds — Phase 1 grows the set to 15+)

| ADR | Title | Status |
|---|---|---|
| [0001](adr/ADR-0001-pern-stack.md) | PERN stack with TypeScript strict | Accepted |
| [0002](adr/ADR-0002-postgres-everywhere.md) | Postgres as the only system of record | Accepted |
| [0003](adr/ADR-0003-modular-monolith-first.md) | Modular monolith first; split deployables only by ADR | Accepted |
| [0004](adr/ADR-0004-r2-cdn-media.md) | Media on Cloudflare R2 + CDN; API never proxies video bytes | Accepted (ToS check open) |
| [0005](adr/ADR-0005-oracle-k3s-compute.md) | Oracle Always Free k3s; bind design to 2 OCPU/12 GB worst case | Conditional on Q3 approval |
| [0006](adr/ADR-0006-redis-roles.md) | Self-hosted Redis with enumerated roles | Accepted |
| [0007](adr/ADR-0007-redpanda-outbox-partitions.md) | Redpanda + outbox; Postgres partitions before ClickHouse | Accepted |
| [0008](adr/ADR-0008-cmaf-clearkey-ssai.md) | CMAF HLS/DASH, ClearKey DRM, cohort-based SSAI | Accepted |
