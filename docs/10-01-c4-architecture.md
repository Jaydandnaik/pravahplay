# 10-01 — C4 Architecture, Bounded Contexts, Service Boundaries

PravahPlay · Phase 1 · 2026-10-29 · Complements ADR-0003 (modular monolith first).

## Level 1 — System context

```mermaid
C4Context
    title PravahPlay — System Context
    Person(viewer, "Viewer", "Free or premium; web/PWA, 10-foot UI")
    Person(kid, "Kids viewer", "Rating-gated profile")
    Person(advertiser, "Advertiser", "Campaigns, creatives, reports")
    Person(ops, "Content & Ad Ops", "CMS, publish workflow, ad-ops")
    Person(sre, "SRE / Operator", "Dashboards, consoles, runbooks")
    System(pravah, "PravahPlay platform", "OTT streaming + ads + live (original branding)")
    System_Ext(cf, "Cloudflare", "DNS, TLS, WAF, CDN, Pages, R2, Turnstile")
    System_Ext(brevo, "Brevo", "Transactional email / OTP")
    System_Ext(fcm, "FCM / Web Push", "Push notifications")
    System_Ext(pay, "Razorpay/Stripe TEST", "Payments simulation")
    System_Ext(tg, "Telegram Bot API", "Alert delivery")
    Rel(viewer, pravah, "Watches, browses, manages profiles")
    Rel(kid, pravah, "Watches gated content")
    Rel(advertiser, pravah, "Runs campaigns")
    Rel(ops, pravah, "Publishes content & ads")
    Rel(sre, pravah, "Operates")
    Rel(pravah, cf, "Serves edge/cdn/media")
    Rel(pravah, brevo, "Sends OTP/emails")
    Rel(pravah, fcm, "Sends push")
    Rel(pravah, pay, "Test-mode checkout + webhooks")
    Rel(pravah, tg, "Alerts")
```

## Level 2 — Container view

```mermaid
flowchart TB
    subgraph Clients
        WEB["web app<br/>(React+Vite PWA)"]
        ADMIN["admin CMS"]
        ADV["advertiser portal"]
    end
    subgraph Edge["Cloudflare"]
        CDN["CDN cache"]
        PAGES["Pages (static apps)"]
        R2[("R2: media + WAL")]
    end
    subgraph Cluster["k3s single node (Oracle Always Free)"]
        API["pravah-api<br/>modular monolith<br/>(Express+TS)"]
        WRK["pravah-worker<br/>(BullMQ consumers)"]
        SIM["pravah-live-sim<br/>(MediaMTX+FFmpeg)"]
        PG[("PostgreSQL 16<br/>+ PgBouncer")]
        RD[("Valkey/Redis")]
        RP[("Redpanda (KRaft)")]
        OBS["Prometheus / Grafana<br/>Loki / Tempo / OTel"]
        AGO["Argo CD"]
    end
    WEB --> CDN --> API
    WEB --> PAGES
    ADMIN --> PAGES
    ADV --> PAGES
    WEB -- "video segments only" --> CDN --> R2
    API --> PG
    API --> RD
    API --> RP
    WRK --> PG
    WRK --> RP
    WRK --> RD
    SIM --> R2
    API --> OBS
    AGO --> Cluster
```

**Delivery rule (ADR-0004):** player↔R2/CDN for all video bytes; `pravah-api` never proxies media.

## Bounded contexts → modules (one repo, one deployable + workers)

| Context | Module (`apps/api/src/modules/…`) | Owns (Postgres schema) | Key events published |
|---|---|---|---|
| Identity & access | `auth` | `auth` | `user.signup`, `auth.session.revoked` |
| Profiles & prefs | `profiles` | `profiles` | `profile.updated` |
| Catalog (system of record) | `catalog` | `catalog` | `title.published`, `title.updated` |
| Discovery & search | `discovery` | `discovery` (read models) | consumes `title.*`, `playback.progress` |
| Playback & entitlement | `playback` | `playback` | `playback.started`, `playback.heartbeat`, `playback.progress` |
| Subscriptions & payments | `billing` | `billing` | `entitlement.changed`, `payment.settled`, `invoice.issued` |
| Ads (decision/manager/tracker) | `ads` | `ads` | `ad.requested`, `ad.decided`, `ad.event` |
| Live & sports | `live` | `live` | `live.state.changed`, `score.updated`, `adbreak.cue` |
| Notifications | `notifications` | `notifications` | consumes most; sends email/push |
| Analytics ingest | `analytics` | `analytics` | consumes QoE/ad events; rollups |
| CMS & ad-ops (admin) | `admin` | `admin` (audit, workflow) | `cms.publish.approved` |

Boundaries enforced by CI (dependency-cruiser): modules import only their own schema repos, shared
packages, or other modules' public `api.ts` + event contracts — never their internals.

## Deployables (runtime)

| Deployable | Image | Contents | Scaling |
|---|---|---|---|
| `pravah-api` | node:22-alpine multi-stage | All modules, HTTP API, SSE endpoints | 1–2 replicas (RAM-bound) |
| `pravah-worker` | same image, worker entry | BullMQ consumers: media transcode dispatch, outbox relay, notification sender, analytics rollup, storage-budget job | 1 replica, concurrency capped |
| `pravah-live-sim` | ffmpeg + mediamtx | Simulated ingest, scoreboard generator (Phase 8) | 1 replica |
| frontends | static | Pages builds (web/admin/advertiser) | CDN |
| transcode jobs | k8s Jobs (FFmpeg) | per-title ladder (Phase 5) | 0–1 concurrent (RAM) |

Postgres/Valkey/Redpanda/observability run as in-cluster workloads (single node, no HA — accepted).

## Key request flows (edge → origin)

- Browse: `web → CDN (segment-keyed rails cache, 60–300 s TTL) → on miss pravah-api/discovery`.
- Play: `web → api/playback (token+manifest) → player → CDN/R2 segments`; heartbeats POST to api,
  land in Redis, batch-flushed to PG; progress events → Kafka → discovery read model.
- Ads: decision path in-process (in-memory index) with 2 s cohort response cache; beacons →
  `/ads/t` (tracker) → Kafka → rollups.
- Live join: admission control at gateway (Redis counter) → token → cohort manifest (CDN-cached).
