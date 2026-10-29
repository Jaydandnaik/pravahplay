# 00-02 — Feature Inventory (MoSCoW → Phases)

Working name: **PravahPlay** · Phase 0 · 2026-10-29
MoSCoW: **M**ust / **S**hould / **C**ould / **W**on't (this release). Phase mapping follows the
brief's phase plan. "Cutline" = if a phase overruns, Could-items drop first, then Should-items —
renegotiated at gates, never silently.

## Accounts & identity (Phase 3)

| Feature | MoSCoW | Phase |
|---|---|---|
| Phone/email OTP signup + login | M | 3 |
| JWT access + rotating refresh w/ reuse detection | M | 3 |
| Device registration, session mgmt, logout-everywhere | M | 3 |
| Multiple profiles, avatars, language prefs | M | 3 |
| Kids profile: rating gate + parental PIN | M | 3 |
| Concurrent device + stream limits (entitlement-driven) | M | 3 |
| Rate limiting + Turnstile bot protection | M | 3 |
| Account recovery, audit log | S | 3 |
| Consent, data export, delete (DPDP/GDPR-style) | S | 3 |
| Passkeys/WebAuthn | C | 11 |

## Catalog, CMS, discovery (Phase 4)

| Feature | MoSCoW | Phase |
|---|---|---|
| Models: movies/series/seasons/episodes/live channels/sports events/people/genres/languages/ratings/artwork | M | 4 |
| Availability windows + regional rights fields | M | 4 |
| Admin CMS w/ RBAC + draft→review→publish | M | 4 |
| Home rails: editorial, trending, personalized, continue-watching | M | 4 |
| Hero carousel + hover trailers | S | 4 |
| Title pages, watchlist | M | 4 |
| Search: FTS, typo-tolerance, autosuggest | M | 4 |
| Voice search (Web Speech API) | C | 4 |
| Genre/language/kids/sports hubs + filters | S | 4 |
| SEO/prerender public pages, image optimization | S | 4 |
| Ratings + content advisories (self-tagged) | S | 4 |

## Media pipeline & VOD playback (Phase 5)

| Feature | MoSCoW | Phase |
|---|---|---|
| Upload → job queue → FFmpeg per-title ladder → CMAF HLS+DASH | M | 5 |
| Multi-audio + WebVTT subtitles | M | 5 |
| Thumbnails + trick-play sprites | M | 5 |
| Intro/recap markers, skip-intro | S | 5 |
| Player (Shaka/hls.js): ABR, resume, audio/sub pickers | M | 5 |
| Next-episode autoplay | S | 5 |
| Playback svc: entitlement, signed manifests, heartbeats | M | 5 |
| Continue-watching sync across devices | M | 5 |
| Concurrent-stream enforcement | M | 5 |
| QoE telemetry (startup, rebuffer, bitrate, errors) | M | 5 |
| Offline downloads (SW + Cache/OPFS, license expiry) | S | 5 |
| ClearKey DRM flow + key service | S | 5 |
| Cast support | C | 5 |
| 10-foot UI / remote navigation | S | 5 |

## Subscriptions & payments (Phase 6)

| Feature | MoSCoW | Phase |
|---|---|---|
| Plans (original names), plan×device×quality×ads×streams matrix | M | 6 |
| Entitlement engine | M | 6 |
| Coupons, trials | S | 6 |
| Test-mode checkout (Razorpay/Stripe test) + mock gateway | M | 6 |
| Webhooks: signature verify, idempotency | M | 6 |
| Invoices, renewal + dunning state machine, grace | M | 6 |
| Refunds (test-mode) | S | 6 |
| Outbox events, reconciliation job | M | 6 |

## Ads platform (Phase 7, brief §9)

| Feature | MoSCoW | Phase |
|---|---|---|
| A: ad server core — eligibility, targeting, freq caps, pacing | M | 7A |
| A: VAST 4.x/VMAP gen + client-side playback, skip/click | M | 7A |
| A: Tracker beacons (imp→complete, click, skip, error), dedup, Kafka topics | M | 7A |
| A: Fail-open everywhere (ad failure never blocks video) | M | 7A |
| B: SSAI manifest stitching HLS (+DASH where practical) | M | 7B |
| B: Cohort-level stitching (CDN-cacheable), SCTE-35→EXT-X-DATERANGE | M | 7B |
| B: Creative conditioning to content renditions | S | 7B |
| C: Advertiser portal (campaigns, flights, creatives, QC, approval) | M | 7C |
| C: Auction (2nd-price, mock OpenRTB bidders, strict timeouts) | S | 7C |
| C: Reporting (imp, reach, freq, CTR, VTR, fill, eCPM, spend) + simulated invoicing | S | 7C |
| C: Forecasting (available inventory) | C | 7C |
| Ad formats beyond pre/mid/post (pause ads, sponsored rails, overlays) | C | 7C |

## Live & sports (Phase 8)

| Feature | MoSCoW | Phase |
|---|---|---|
| Live ingest sim (FFmpeg→MediaMTX→LL-HLS/DASH) | M | 8 |
| Channel lineup + EPG, event scheduling/pages | M | 8 |
| DVR window, multi-language commentary feeds | M | 8 |
| Multicam angles | C | 8 |
| Match center: scores/stats/commentary via SSE/WS + CDN-poll fallback | M | 8 |
| Watch-along reactions (rate-limited, moderated) | S | 8 |
| Live concurrency counter (HLL + sharded counters) | M | 8 |
| Pre-scale scheduler, waiting room/admission control | M | 8 |
| Panic-mode degradation toggles, ad-break trigger console (SCTE-style) | M | 8 |

## Personalization, notifications, analytics (Phase 9)

| Feature | MoSCoW | Phase |
|---|---|---|
| Recommendations: co-watch item-item, cohort popularity, pgvector similarity | S | 9 |
| Explainable rails, continue-watching ranking, time-decay trending | S | 9 |
| Notifications: email, web push, FCM + preference center | S | 9 |
| Match reminders | C | 9 |
| A/B testing framework | S | 9 |
| Analytics pipeline (collector→Kafka→store) + dashboards (DAU/MAU, retention, funnels, QoE, content, ads) | M | 9 |

## Platform & cross-cutting

| Feature | MoSCoW | Phase |
|---|---|---|
| i18n en/hi/mr + framework | M | 4→9 |
| PWA (installable, offline shell) | S | 5 |
| Accessibility WCAG 2.2 AA | S | 11 |
| Feature flags (OpenFeature/Unleash) | M | 2 |
| Observability: RED/USE, traces, burn-rate alerts | M | 2 |
| Degradation ladder + kill switches | M | 8/10 |
| Load/soak/spike/chaos suites | M | 10 |
| DR drills w/ measured RTO/RPO | M | 10 |
| OWASP ASVS L2, CSP/HSTS, WAF, ZAP scan | M | 11 |

## Explicit Won't-haves (this release)

- Native iOS/Android/TV apps; real Widevine/FairPlay/PlayReady DRM (paid licensing); real SMS OTP
  (mocked); real money movement (test-mode payments only); user-generated content uploads;
  third-party programmatic demand (mock bidders only).
