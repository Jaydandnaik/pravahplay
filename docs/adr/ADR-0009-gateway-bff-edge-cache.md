# ADR-0009 — Gateway/BFF layer and edge-cache keying

Status: Accepted (Phase 1, 2026-10-29)

## Context
Three frontends (web, admin, advertiser) consume one modular monolith. Read paths must be
CDN-cacheable per audience segment (00-04 §3 assumes 95%+ browse offload); personalized payloads
must never be cached publicly. Cloudflare Pages hosts the SPAs.

## Options
1. **Thin BFF module inside the monolith** (`/v1/*` gateway module: auth edge, segment-key cache
   headers, response shaping) — one deployable (ADR-0003).
2. Separate gateway-bff deployable (Kong/Express) — extra RAM + hop at the worst-case 12 GB budget.

## Decision
Option 1 for now: a `gateway` module owning routing concerns, cache-header policy
(`public/segment/private` classes from 10-08), Turnstile verification, and rate-limit enforcement;
business modules stay pure. Extraction to a standalone gateway is pre-approved IF an ADR shows
load evidence (it is the first candidate split when scaling beyond one node).

## Consequences
(+) RAM budget preserved; one deploy pipeline; cache policy in one place.
(−) Gateway and business logic share a restart domain (accepted, same as ADR-0003); cache-key
discipline must be enforced in review (no private payload ever marked `public|segment`).

## Cost impact / over-limit / fallback
Zero. Fallback: Cloudflare Workers could serve as a future edge-BFF within free tier if origin
offload needs improvement (verify Workers free limits before adoption).
