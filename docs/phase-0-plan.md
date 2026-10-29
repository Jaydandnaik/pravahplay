# Phase 0 Plan — Discovery and Constraint Lock

- **Status:** IN PROGRESS — kickoff questions issued 2026-10-29; document production begins when
  answers arrive, or immediately on the reply "defaults".
- **Gate:** this phase ends with `docs/00-10-phase-0-gate-report.md`. Then work stops and waits for
  **APPROVED PHASE 0**.
- **Hard rule:** no feature code in Phase 0. Docs, models, registers and ADRs only.

## Objective

Lock scope, quality targets, capacity math, the cost envelope, the legal posture and the brand
before the first line of feature code — so Phases 1–11 are execution against a stable contract
instead of moving targets.

## Inputs

Ten kickoff questions with proposed defaults (`docs/00-00-kickoff-questions.md`). Two are
decision-class and **block** execution until answered:

- Q3 — Oracle Cloud signup requires a card for identity verification (cost class; the brief demands
  explicit written approval for anything card-on-file).
- Q4 — public vs private GitHub repo (legal class; public repo is what makes CI/CD free at zero
  cost, but publishing code is the owner's call).

All other questions fall back to their defaults if unanswered; defaults are logged in
`docs/ASSUMPTIONS.md` as provisional and confirmed at answer time.

## Deliverables (exact documents)

| # | Document | Contents | Method notes |
|---|----------|----------|--------------|
| 0 | `docs/00-00-kickoff-questions.md` | 10 questions, defaults, recorded answers | Created at kickoff |
| 1 | `docs/00-01-personas-and-journeys.md` | 6–8 personas; 10–12 user journeys (signup→first play, match-day live join, kids profile, plan upgrade, advertiser campaign launch, degradation-mode experience) | Mermaid sequence diagrams for the 3 critical journeys |
| 2 | `docs/00-02-feature-inventory.md` | Every feature from the brief (§4 catalog of features, §5 architecture features, §9 ads platform) with MoSCoW priority, mapped phase, dependencies, acceptance hint | Hard cutline per phase; scope changes are renegotiated at gates, never silently dropped |
| 3 | `docs/00-03-nfrs-and-slos.md` | Non-functional requirements (performance, availability, durability, security, privacy, accessibility, i18n) + SLO table with error budgets | Refines the brief §10 targets into measurable, alertable numbers |
| 4 | `docs/00-04-capacity-model.md` | Traffic-unit model at 10k / 100k / 1M / 10M peak concurrent viewers: per-service RPS, bandwidth, storage growth, Postgres connections, Kafka throughput, ad decision RPS; CDN offload assumptions; lab-extrapolation method | All arithmetic shown and reviewable; every scale claim labeled lab-proven / extrapolated / design-only |
| 5 | `docs/COST_REGISTER.md` (Phase-0 snapshot preserved as `docs/00-05-cost-register-snapshot.md`) | Every external service: free limit, expected peak usage, over-limit action, free fallback, verified date + source URL | First full verification pass happens in this phase; re-verified at every gate and monthly |
| 6 | `docs/00-06-risk-register.md` | Ranked likelihood × impact; mitigation, trigger, contingency for each | Includes the existential zero-cost risks (video delivery economics, provider reclamation) |
| 7 | `docs/00-07-content-and-legal-plan.md` | Asset manifest with licenses and attribution plan; brand clearance approach; DPDP/GDPR-style privacy posture; DRM constraints (ClearKey only) | No copyrighted material, ever; every asset traceable to its license |
| 8 | `docs/00-08-brand.md` | Final name + screened alternates, wordmark concept (SVG), palette, typography, voice | Original assets only; quick trademark/web screen documented |
| 9 | `docs/00-09-tech-stack-and-adrs.md` | Final stack summary + ADR index; seeds ADR-0001…ADR-0008 in `docs/adr/` (stack, monorepo, Postgres-everywhere, Redis, event backbone, media storage/delivery, compute, deployable-count) | Each ADR carries context, options, decision, consequences, **cost impact, over-limit action, free fallback**; Phase 1 grows the set to 15+ |
| 10 | `docs/00-10-phase-0-gate-report.md` | What was produced, evidence, deviations from the brief, open risks, cost register status, proposed Phase 1 plan | The gate artifact |

Living documents maintained from day one: `docs/PROGRESS.md`, `docs/ASSUMPTIONS.md`,
`docs/COST_REGISTER.md`, `docs/adr/`.

## Exit criteria

1. All documents above exist and are mutually consistent (names, numbers and phase mappings
   cross-check).
2. Every `COST_REGISTER` row is VERIFIED with date + source URL. Stale knowledge (including model
   training data) never counts as verification — limits are re-checked against provider docs at
   execution time.
3. Capacity-model arithmetic is independently checkable; every scale claim carries its evidence
   class (lab-proven / extrapolated / design-only).
4. At least 8 seed ADRs exist, each with cost impact, over-limit action and free fallback.
5. Gate report posted; work stops; wait for **APPROVED PHASE 0**.

## Out of scope for Phase 0

Any feature code, repository scaffolding beyond documentation, and provider account provisioning
(accounts are created in Phase 2, after Q3/Q4 approvals).
