# ADR-0004 — Media on Cloudflare R2 + CDN; the API tier never proxies video bytes

Status: Accepted, with an open ToS-verification action (Phase 2) · 2026-10-29

## Context
1M CCV at 3 Mbps ≈ 3 Tbps — only a CDN can serve that. Zero-cost requires free egress. Verified
2026-10-29: R2 free = 10 GB storage, 1M Class A ops/mo, 10M Class B ops/mo, **zero egress fees**;
Cloudflare CDN caches public-bucket objects in front of it.

## Options
1. **R2 behind Cloudflare CDN** (origin offload ≥ 99%).
2. Backblaze B2 + Bandwidth Alliance (free egress via Cloudflare).
3. VM-hosted origin with NGINX — VM NIC and free-tier egress make this a non-starter beyond toy scale.

## Decision
Option 1, with option 2 as the pre-designed fallback (same bucket-prefix layout, S3-compatible
APIs — switching is config). Hard rule from the brief, restated as architecture law: **no API
service ever proxies video bytes**; the player talks to CDN/R2 directly with signed URLs.

## Consequences
(+) Zero egress cost; CDN absorbs the request volume (00-04 §5 derives the sustained-CCV ceiling
from the Class B budget: ~2.3k CCV @99% hit, ~23k @99.9%).
(−) 10 GB storage forces a curated demo catalog (00-04 §5 budget table); a storage-budget job must
gate uploads. Open risk: Cloudflare's terms on video delivery via free tiers must be re-read
before production reliance (action recorded in COST_REGISTER row 3 + risk register R1).

## Cost impact / over-limit / fallback
Cost: ₹0 within allowances. Over-limit action: uploads blocked by the storage-budget job; alerts
at 80%/95% of Class A/B quotas. Fallback: Backblaze B2 (10 GB free, free egress via Bandwidth
Alliance — verified 2026-10-29).
