# 00-07 — Content and Legal Plan

Working name: **PravahPlay** · Phase 0 · 2026-10-29

## Standing rules (constraint #5 of the brief)

1. No JioHotstar/Jio/Disney/IPL/BCCI (or any real league/studio/broadcaster) names, logos, UI
   assets, footage or metadata. Applies to code, docs, demo data, marketing pages.
2. All content is openly licensed or self-made; every asset is traceable to its license.
3. Original branding only (see `00-08-brand.md`).
4. DRM via ClearKey/open test keys only — Widevine/FairPlay/PlayReady require paid licensing
   (Google/Cisco/Apple programs); we state this plainly in the UI where users would expect DRM.

## Asset manifest (seed catalog)

| Asset | License | Attribution required | Source |
|---|---|---|---|
| Big Buck Bunny (2008) | CC-BY 3.0 | © Blender Foundation | peach.blender.org |
| Sintel (2010) | CC-BY 3.0 | © Blender Foundation | durian.blender.org |
| Tears of Steel (2012) | CC-BY 3.0 | © Blender Foundation | mango.blender.org |
| Cosmos Laundromat (2015) | CC-BY 4.0 | © Blender Foundation | gooseberry.blender.org |
| Elephants Dream (2006) | CC-BY 2.5 | © Blender Foundation | orange.blender.org |
| Test patterns / synthetic loops | CC0 (self-generated via FFmpeg) | none | generated in-pipeline |
| Simulated "match" feed | self-made (looped stock-style footage we generate + scoreboard overlay) | none | generated |
| Scoreboard/commentary data | self-generated fixtures | none | simulator service |
| Music beds | CC0 (e.g., FreePD) or CC-BY with credit file | check per track | freepd.com et al. |

Rules: no thumbnails/stills lifted from the films for unrelated marketing; credit files ship with
every title page ("© Blender Foundation, CC-BY"); a `CREDITS.md` + per-title `license` field in the
catalog schema make attribution machine-readable; the CMS blocks publishing a title without a
license field.

## Brand clearance approach (quick screen, not legal advice)

- Web + app-store + trademark-registry keyword screen per candidate (done for Phase 0 —
  `00-08-brand.md`); formal clearance/registration in India (IP India, class 9/38/41) is the
  owner's call at funded scale.
- The recorded "JioHotstar" answer in `00-00` is rejected: registered trademark of the JioStar
  group and forbidden by the brief's own constraint #5.

## Content ratings & advisories

- Self-tagged ratings (original scheme: e.g., `U / U-7+ / U-13+ / A-16+`) — never copied from CBFC,
  BBFC or any board; content advisories (violence, language) self-declared in CMS, gated by kids
  profile (J3).

## Privacy posture (DPDP-style)

| Data | Purpose | Retention | Notes |
|---|---|---|---|
| Phone/email identifier | auth | life of account | email OTP real, SMS mocked (log/console) |
| Profiles, prefs, watchlist | service | life of account | exportable |
| Playback progress/heartbeats | resume, concurrency | 2 y | aggregated after |
| QoE telemetry | reliability | 90 d | no content of frames; device class only |
| Ad events (impressions/clicks) | ads reporting | 180 d raw, aggregates kept | pseudonymous IDs |
| Audit logs (admin actions) | security | 1 y | immutable append |
| OTP codes | auth | 15 min | hashed |

- Consent record at signup; granular notification preferences; data map lives in this file and is
  updated when new data classes appear (checked at each gate).

## Third-party terms we depend on (honesty list)

- Cloudflare ToS historically restricted serving disproportionate non-HTML content on the free CDN;
  R2 is the sanctioned path for media (no egress fees). **Action:** verify the current
  Cloudflare/R2 terms clause for video delivery before production reliance (Phase 2, recorded in
  COST_REGISTER row 3); fallback is Backblaze B2 + Bandwidth Alliance.
- Blender Foundation CC-BY requires attribution + license copy distribution — handled by the credit
  files above.
- Razorpay/Stripe TEST MODE only: no real money, clearly labeled in UI and invoices ("TEST").

## Won't-do list (legal)

No scraping of any third-party catalog/metadata; no real sports data feeds (scoreboard is
simulated); no unlicensed fonts (inter/ Sora etc. are OFL); no analytics/tracking SDKs beyond
first-party.
