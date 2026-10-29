# ADR-0008 — CMAF HLS/DASH packaging, ClearKey DRM, cohort-based SSAI

Status: Accepted (Phase 0, 2026-10-29)

## Context
One packaged asset set must serve HLS and DASH players; DRM must be open/test-key (Widevine/
FairPlay/PlayReady are paid license programs — forbidden at zero cost); server-side ad insertion
must not break CDN caching (the naive per-user stitched manifest is uncacheable and would melt
origin at scale).

## Options (per sub-decision)
Packaging: (a) **CMAF single-rendition-set fMP4, HLS+DASH manifests via Shaka Packager, ladder by
FFmpeg per-title**; (b) separate TS-HLS + DASH encodes (2× storage — rejected, R2 budget).
DRM: (a) **ClearKey (DASH-IF) + AES-128 HLS fallback + signed short-lived URLs**; (b) none;
(c) commercial DRM (rejected: paid).
SSAI: (a) **cohort-based stitching** — viewers bucketed into a small number of stitching cohorts
(e.g., by plan×region×ad-load); each cohort gets its own CDN-cacheable manifest; ad segments are
the same cacheable objects; (b) per-user manifests (uncacheable — rejected).

## Decision
(a)+(a)+(a) as above. SCTE-35-style cues become EXT-X-DATERANGE in cohort manifests;
discontinuity handled at pod boundaries; ad creatives conditioned to match content renditions
(codec/resolution ladder bucket) so the player never re-initiates mid-stream.

## Consequences
(+) ~half the storage of dual packaging (matters at 10 GB); SSAI inherits CDN hit ratios instead
of destroying them; ClearKey demonstrates the full DRM workflow (key service, license expiry,
offline rules) with zero licensing cost.
(−) ClearKey/ AES-128 is **not** content-security-grade (determined users can extract keys) —
stated honestly in UI docs; cohort granularity trades ad-targeting precision for cacheability
(per-user targeting limited to cohort-level creative selection + client-side companion ads);
CMAF requires modern players (Shaka/hls.js — fine per Q7 device baseline).

## Cost impact / over-limit / fallback
All OSS — zero. Over-limit: none. Fallback: if ClearKey interop pain exceeds value, ship clear
DASH/HLS + signed URLs (decision reversible per title).
