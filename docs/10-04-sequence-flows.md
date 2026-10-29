# 10-04 — Sequence Flows (login, play, ad break, live join, payment webhook)

PravahPlay · Phase 1 · 2026-10-29 · These five flows are the contract backbone; Phase 3+ builds to
them, Playwright e2e tests assert them.

## Login (OTP)

```mermaid
sequenceDiagram
    participant C as Client (web)
    participant E as Cloudflare (Turnstile)
    participant A as pravah-api /auth
    participant R as Redis
    participant P as Postgres
    participant B as Brevo
    C->>E: solve challenge
    C->>A: POST /auth/otp/request {identifier, turnstileToken}
    A->>E: siteverify token
    A->>R: rate-limit check (ip, identifier)
    A->>P: upsert auth_identifier; store hashed_otp (15 min)
    A->>B: send OTP email (300/day budget; queue if cap)
    A-->>C: 204
    C->>A: POST /auth/otp/verify {identifier, code}
    A->>P: verify hash, attempts<5
    A->>P: create session + refresh token (hashed)
    A->>R: cache session; store refresh-chain state
    A-->>C: {accessToken(10min), profiles[]} + HttpOnly refresh cookie
    Note over A,P: reuse detection: presented refresh token must be leaf of chain,<br/>else revoke whole session (audit_log entry)
```

## Play (VOD)

```mermaid
sequenceDiagram
    participant C as Client
    participant A as pravah-api /playback
    participant R as Redis
    participant P as Postgres
    participant CF as CDN/R2
    C->>A: POST /playback/sessions {titleId, profileId}
    A->>A: JWT auth; entitlement check (billing entitlements cache)
    A->>R: concurrency counter check (plan.maxStreams)
    A->>P: insert playback_session; issue manifest token (jti, ≤5 min)
    A-->>C: {sessionId, manifestUrl signed, drm:{type:clearkey}}
    C->>CF: GET master.m3u8 (signed)
    CF-->>C: master → media playlist (CMAF fMP4, WebVTT, multi-audio)
    C->>CF: GET segments (byte-range fMP4)
    loop every 30 s
        C->>A: POST /playback/sessions/{id}/heartbeat {positionS, rendition}
        A->>R: buffer heartbeat; concurrency TTL refresh
        A-->>C: {decision: continue}
    end
    Note over A,P: worker flushes heartbeats → watch_progress (5 s batch)<br/>+ playback.events → Kafka (discovery/analytics)
    C->>A: POST /playback/sessions/{id}/end
```

## Ad break (live, SSAI cohort path)

```mermaid
sequenceDiagram
    participant OPS as Ops console
    participant L as pravah-api /live
    participant K as Redpanda
    participant S as SSAI stitcher (ads module)
    participant CF as CDN
    participant V as Viewer
    OPS->>L: POST /live/events/{id}/adbreak-cue {durationS}
    L->>K: live.events {type: adbreak.cue, seq}
    S->>S: allocate pod: decision index (cohort targeting, freq cap, pacing)
    S->>K: ad.requests + ad.decisions
    S->>CF: publish cohort manifest variant + DATERANGE/DISCONTINUITY (cacheable, 2 s TTL)
    V->>CF: GET cohort playlist (polling live window)
    CF-->>V: stitched playlist (content + ad pod segments, renditions conditioned)
    V->>V: player plays pod; fires client + server beacons
    V->>CF: POST /ads/t/{beaconId}/{type} (via API, no-cache)
    Note over S,CF: fail-open: decision timeout 50 ms p99 / 300 ms hard cap → serve content without pod
```

## Live join (match start spike)

```mermaid
sequenceDiagram
    participant V as Viewer
    participant A as pravah-api
    participant R as Redis
    participant CF as CDN
    V->>A: POST /playback/sessions (live event)
    A->>R: admission check: live:ccv vs budget + waiting-room config
    alt admitted
        A-->>V: session + token + cohort manifest URL
        V->>CF: LL-HLS parts + segments (cohort-cacheable)
    else over budget
        A-->>V: 202 {queued: true, position, pollAfterMs (jittered)}
        V->>A: poll (jittered) until admitted
    end
    Note over A,R: admission budget from pre-scale scheduler;<br/>ladder D2 enables waiting room automatically
```

## Payment webhook (test mode)

```mermaid
sequenceDiagram
    participant PY as Razorpay/Stripe (test)
    participant A as pravah-api /billing
    participant P as Postgres
    participant K as Redpanda
    PY->>A: POST /billing/webhooks/{provider} (signed)
    A->>A: verify HMAC signature
    A->>P: insert webhook_events (provider_event_id UNIQUE) — conflict → 200 (idempotent replay)
    A->>P: apply payment state transition (captured/failed/refund)
    A->>P: extend/expire subscription; recompute entitlements
    A->>K: billing.events {payment.settled, entitlement.changed} (outbox, same txn)
    A-->>PY: 200
    Note over A,P: invoice issued by worker; dunning scheduler handles failures with backoff
```
