# 10-03 — API Contracts (OpenAPI) and Event Schemas (AsyncAPI)

PravahPlay · Phase 1 · 2026-10-29

## Approach

- One OpenAPI 3.1 document per module, composed into a gateway document (`packages/api-spec/`).
- Zod schemas are the single source of truth; OpenAPI is **generated** from them (zod-openapi) at
  build time — code and contract cannot drift. Contract tests (Pact) pin consumer/provider pairs.
- Auth: JWT bearer (access, 10 min) + HttpOnly refresh cookie (rotating). All errors RFC 7807
  (`application/problem+json`). Cursor pagination everywhere: `?limit=&cursor=` →
  `{ items, nextCursor }`. Idempotency: `Idempotency-Key` header on unsafe POSTs (billing, ads
  campaign ops, OTP retry).
- Versioning: `/v1/...` path prefix; additive changes only within v1.

## Key endpoint shapes (v1, gateway-composed)

```
POST /v1/auth/otp/request        {identifier}                       → 204 (Turnstile token required)
POST /v1/auth/otp/verify         {identifier, code}                 → {accessToken, user, profiles[]}
POST /v1/auth/refresh            (cookie)                           → {accessToken} (+ rotated cookie)
POST /v1/auth/sessions/revoke-all                                     → 204
POST /v1/profiles                {name, isKids, language, pin?}     → Profile
GET  /v1/catalog/titles?kind=&genre=&lang=&q=&cursor=               → TitlePage
GET  /v1/catalog/titles/{slug}                                      → TitleDetail (credits, assets, license)
GET  /v1/discovery/rails/{home|kids|sports}?segment=                → Rail[]  (edge-cacheable 60–300 s)
GET  /v1/search/suggest?q=                                          → Suggestion[]
GET  /v1/watchlist                        PUT/DELETE /v1/watchlist/{titleId}
POST /v1/playback/sessions       {titleId, episodeId?, profileId}   → {sessionId, manifestUrl, drm: {type:"clearkey", ...}}
GET  /v1/playback/manifests/{jti}/master.m3u8 | .mpd                 → manifest (signed, ≤5 min TTL)
POST /v1/playback/sessions/{id}/heartbeat {positionS, rendition}    → {decision:"continue"|limit}
POST /v1/playback/sessions/{id}/end                                 → 204
GET  /v1/live/events                      GET /v1/live/events/{id}/match-center (SSE; poll fallback)
POST /v1/live/events/{id}/adbreak-cue  (ops console; SCTE-style)    → 202
POST /v1/billing/plans/{code}/subscribe  {coupon?}                  → {checkoutUrl} (test mode)
POST /v1/billing/webhooks/{provider}   (signature-verified)         → 200 (idempotent)
GET  /v1/billing/invoices                      GET /v1/billing/subscription
POST /v1/ads/decision            {cohort, breakSlot, podDurationS, contentContext} → VAST/VMAP (p99 <50 ms)
GET  /v1/ads/vmap/{contentId}                                        → VMAP
POST /v1/ads/t/{beaconId}/{type}                                       → 204 (tracker; no-cache)
POST /v1/analytics/collect       {events[]}                         → 202 (batched client telemetry)
# admin (RBAC): /v1/admin/cms/* (draft→review→publish), /v1/admin/ads/*, /v1/admin/ops/*
#   (feature flags, degradation ladder, pre-scale, waiting-room config)
# advertiser portal: /v1/adv/campaigns, /flights, /creatives, /reports
# ops: GET /healthz, /readyz, /metrics (Prometheus), /openapi.json
```

## AsyncAPI — event catalogue (Kafka, per ADR-0007)

| Topic | Key | Payload (envelope) | Producers → Consumers |
|---|---|---|---|
| `user.events` | userId | `{type: signup\|session.revoked, at, data}` | auth → notifications, analytics |
| `catalog.events` | titleId | `{type: published\|updated, at, title}` | catalog → discovery rebuild, notifications |
| `playback.events` | userId | `{type: started\|heartbeat\|progress\|ended, sessionId, positionS, ...}` | playback → discovery (continue-watching, co-watch), analytics |
| `billing.events` | userId | `{type: entitlement.changed\|payment.settled\|invoice.issued, ...}` | billing → playback (entitlements), notifications |
| `ad.requests` / `ad.decisions` | cohort | `{requestId, cohort, breakSlot, pod, ts}` | ads → analytics, reconciliation |
| `ad.events` | beaconId | `{type: impression\|start\|q1\|mid\|q3\|complete\|click\|skip\|error, creativeId, ...}` | tracker → rollups, pacing/freq Redis updates |
| `live.events` | eventId | `{type: state.changed\|score\|commentary\|adbreak.cue, seq, ...}` | live → match-center SSE fan-out, SSAI stitcher |
| `analytics.events` | sessionId | `{family: qoe\|web, at, data}` | collector → analytics rollups |
| `notifications.requests` | userId | `{channel: email\|webpush\|fcm, template, data}` | any → notifications sender |

Envelope rules: `schemaVersion:int`, `eventId:uuid`, `occurredAt` ISO-8601; consumers idempotent by
`eventId` (inbox table per module). Partitioning by entity key preserves per-entity ordering.

## Consistency & idempotency (contract-level rules)

- All state-changing endpoints accept `Idempotency-Key` (stored 24 h, replay stored response).
- Outbox (ADR-0007): PG transaction commits domain row + outbox row; relay publishes ≥1×; consumers
  dedup by `eventId`. Events carry full read-model payloads (no N+1 replay).
- Payment webhooks: verify signature → dedup on provider event id → apply → enqueue side effects.
  Never trust client redirects for state.
- Playback tokens: JWT with `jti` in Redis denylist for revocation; manifest URL = one-time exchange
  (`jti` single-use for VOD, cohort-stable for live).
