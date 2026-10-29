# 00-10 — Phase 0 Gate Report

Working name: **PravahPlay** · 2026-10-29 · **Status: PHASE 0 COMPLETE — STOPPED, awaiting
APPROVED PHASE 0.**

## What was produced (all documents exist and cross-check)

| Deliverable | File | Evidence |
|---|---|---|
| Kickoff Q&A + answer record | `00-00-kickoff-questions.md` | 10 questions; defaults active; 2 blocking held open |
| Personas & journeys | `00-01-personas-and-journeys.md` | 7 personas, 12 journeys, 3 Mermaid sequences (J2/J6/J8) |
| Feature inventory | `00-02-feature-inventory.md` | ~100 features, MoSCoW, mapped to phases 2–11, Won't-haves explicit |
| NFRs & SLOs | `00-03-nfrs-and-slos.md` | 9 SLOs w/ budgets; D0–D4 degradation ladder; privacy/a11y/i18n NFRs |
| Capacity model | `00-04-capacity-model.md` | 10k/100k/1M/10M tables; RAM & R2 budgets; evidence classes; extrapolation method |
| Cost register | `COST_REGISTER.md` + `00-05` snapshot | 18 services verified with sources & confidence; 4 open actions |
| Risk register | `00-06-risk-register.md` | 18 risks, top-3 = Oracle, CDN ToS, spike/SPOF |
| Content & legal plan | `00-07-content-and-legal-plan.md` | Licensed asset manifest, ratings scheme, privacy data map |
| Brand | `00-08-brand.md` + `assets/wordmark-concept.svg` | 7 candidates screened; **PravahPlay** clean; SVG concept |
| Stack + ADRs | `00-09-tech-stack-and-adrs.md` + `adr/ADR-0001…0008` | 8 seed ADRs, each with cost/over-limit/fallback |

Living docs current: `PROGRESS.md`, `ASSUMPTIONS.md`, `COST_REGISTER.md`.

## Key findings this phase (things that changed our plans)

1. **Oracle halved Always Free to 2 OCPU / 12 GB for new tenancies (mid-2026, unannounced).**
   Production design now binds to the worst case (ADR-0005, RAM budget in 00-04 §6); 4/24 is
   upside only. This is the strongest argument for the modular-monolith decision.
2. **R2's free 10 GB ≈ 2.3 hours of full-ladder content** — the demo catalog is a curated budget
   (00-04 §5), enforced by a storage-budget job, not a bulk library.
3. **All four original brand candidates were already in use** (StreamSetu, ChitraPlay, TaraStream,
   GullyPlay). PravahPlay screens clean.
4. **A "JioHotstar" answer was recorded and rejected** — registered trademark; forbidden by the
   brief's own constraint #5. Flagged for the owner at this gate.
5. Upstash free (256 MB / 500K cmd/mo) is too small as a primary — self-hosted Redis only.

## Deviations from the brief

- Phase 0 performed by chat + research agents rather than a workshop — same artifacts.
- Brand quick-screen is web-based; formal trademark registry check deferred to pre-launch
  (recorded as checklist item + risk R18).
- All 10 kickoff questions were answered by "proceed with defaults" instruction rather than
  individually; Q3/Q4 remain explicitly open (below).

## Open decisions for the owner (blocking Phase 2, not Phase 1)

1. **B-001 / Q3**: approve card-on-file for Oracle Always Free (yes/no). If no: fallback compute
   changes Phase 2 design.
2. **B-002 / Q4**: public vs private GitHub repo (public = the only zero-cost CI/CD path).
3. **Brand ratification**: PravahPlay (or a rename — cheap now).
4. **Repo location**: recommend moving out of OneDrive before Phase 2 (R16).

## Cost register status

All 18 rows verified 2026-10-29 with sources and confidence classes; 4 open actions tracked
(Cloudflare video ToS re-read, Oracle quota re-read at signup, GHCR terms at first push, Brevo
quota alerting). ₹0 spent; nothing billable provisioned.

## Proposed Phase 1 (System design, no feature code)

C4 context/container/component diagrams; bounded contexts + ERDs per module schema with indexes/
partitioning/retention; OpenAPI contracts + AsyncAPI event schemas; sequence diagrams for login,
play, ad break, live join, payment webhook; video pipeline, ad architecture (CSAI+SSAI), live
architecture, caching strategy per layer, consistency/idempotency strategy, failure-mode +
degradation ladder mapping, backup/DR design, STRIDE threat model, observability design; risk
spikes: (1) SSAI HLS manifest stitching with FFmpeg, (2) Postgres event-table write rate,
(3) free-VM RAM budget validation. Target ≥ 15 ADRs. Exit: gate report → APPROVED PHASE 1.

**Work is stopped here per the working agreement. No feature code will be written until
APPROVED PHASE 0 (and then APPROVED PHASE 1).**
