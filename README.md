# PravahPlay (working name — owner ratifies at the Phase 0 gate)

> Note: a `JioHotstar` name was recorded by the owner and **rejected** — it is a registered
> trademark of the JioStar group and is forbidden by this project's own constraint #2 below and
> by the brief. Screening and rationale: `docs/00-08-brand.md`.

Zero-cost, production-grade OTT streaming platform built with the publicly known architecture
patterns of large-scale live-sports streaming services: CDN-first HLS/DASH delivery, server-side
ad insertion, tokenized playback URLs, an event backbone, heavy layered caching, CQRS on read-heavy
paths, admission control, and a graceful-degradation ladder. Stack: PERN — PostgreSQL (system of
record), Express on Node.js (TypeScript), React (TypeScript + Vite).

## Status

Phase 0 — Discovery and constraint lock. **No feature code in this phase.**

## Start here

- `docs/phase-0-plan.md` — current phase plan and exit criteria
- `docs/00-00-kickoff-questions.md` — the 10 kickoff questions, defaults, and recorded answers
- `docs/PROGRESS.md` — what is done / in progress / blocked / next
- `docs/ASSUMPTIONS.md` — every assumption made to keep work moving
- `docs/COST_REGISTER.md` — every external service, its free limit, usage, and verification date
- `docs/adr/` — architecture decision records (seeded during Phase 0)

## Standing constraints (enforced in every phase)

1. Strictly zero cost: open-source software and permanently-free tiers only; nothing that can bill
   without explicit written approval. Every infra choice has an ADR with an over-limit action and a
   free fallback.
2. Original branding only; openly licensed or self-made content only. No names, logos, UI assets or
   content from any real streaming service, studio, league or broadcaster.
3. DRM via open/test keys (ClearKey) only — Widevine/FairPlay/PlayReady need paid licensing.
4. Production-grade: health endpoints, structured logs, metrics, traces, OpenAPI docs, tests,
   runbooks, graceful shutdown — for every service.
5. Honesty: results are never faked; scale is proven by design + lab load tests + a capacity model,
   with the lab-vs-target gap stated in every report.
