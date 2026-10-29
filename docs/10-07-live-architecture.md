# 10-07 — Live & Sports Architecture

PravahPlay · Phase 1 · 2026-10-29

## Simulated live chain

```mermaid
flowchart LR
    SRC[Looped source<br/>(Blender footage + generated scoreboard overlay)] --> FFM[FFmpeg<br/>2 renditions, 6 s segments<br/>LL-HLS parts 500 ms]
    FFM --> MTX[MediaMTX (RTMP/SRT in,<br/>LL-HLS out to staging prefix)]
    MTX --> R2[(R2: rotating DVR window<br/>~30 min)]
    R2 --> CDN[Cloudflare CDN]
    SIM[scoreboard simulator<br/>state machine: toss→overs→wickets] --> PG[(live schema)]
    PG --> SSE[pravah-api SSE /match-center]
    SSE --> V[Viewers]
```

- `pravah-live-sim` deployable runs FFmpeg→MediaMTX→R2 staging; a "channel manager" rotates the DVR
  window (drop old segments; storage-budget aware) and flips event state `scheduled→live→break→ended`.
- Commentary generator emits text lines (multi-lang) driven by scoreboard state; match center is
  SSE from `live.events` topic with a CDN-cached JSON poll fallback (jittered 6–10 s).

## Event lifecycle

| Phase | Platform behavior |
|---|---|
| T-60 min | pre-scale scheduler: HPA replicas up, DB pools warmed, Redis caches primed, CDN pre-warm of hero/title pages, waiting room armed |
| T-0 spike | admission control (Redis token bucket per region-free global budget); overflow → waiting room (202 + jittered poll, position + ETA) |
| During | DVR rewind within window; commentary language switch; multicam (C) = same event, separate rendition sets; watch-along reactions (rate-limited, moderated, Phase 8S) |
| Break | cue console → SSAI pod (10-06); score state `break` |
| Post | event ended; VOD-style availability; stats rollups |

## Concurrency & admission internals

- `live:ccv` = HyperLogLog union of `conc:{session}` registers + sharded integer counters per
  replica (Redis INCR with TTL heartbeat); accuracy vs exactness documented (HLL ±0.8% typical).
- Admission budget = min(origin token-path capacity, manifest-path capacity) — derived from
  Phase 10 load tests, not guessed; waiting-room position = bucketed counter (not exact queue —
  honest UX copy).
- Panic-mode toggles (feature flags, ops console): disable reactions, disable personalization,
  shorten DVR, cap bitrate cohort manifests, enable waiting room for all — the D1–D4 ladder
  (00-03) wired to flags with automatic burn-rate triggers + manual override.

## DVR/rewind

LL-HLS `#EXT-X-PART` + sliding window; DVR seek = direct segment fetch by timestamp (segments are
content-addressed in R2 within window); window end enforced (404 → player snaps to live edge).

## Multilanguage commentary & multicam

- Commentary: SSE streams per lang; audio feeds = separate FFmpeg audio renditions (EN/HI) exposed
  as HLS audio groups (same as VOD multi-audio path).
- Multicam (Could, Phase 8): distinct camera loops packaged as separate titles under one event
  bundle; switcher UI swaps manifest, resumes at live edge.
