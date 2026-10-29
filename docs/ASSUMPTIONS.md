# ASSUMPTIONS

Working agreement §7.2: routine questions never stop work — the best-informed assumption is logged
here and work continues. Only cost, legal or irreversible decisions stop work.

Each entry records: date, the assumption, why it is reasonable, the impact if wrong, and the review
trigger. Superseded entries stay in place, marked superseded.

## Provisional (kickoff defaults — pending answers to `00-00-kickoff-questions.md`)

| ID | Date | Assumption (default) | Impact if wrong | Status |
|---|---|---|---|---|
| A-001 | 2026-10-29 | Working brand name = **StreamSetu** until Q1 answered | Cheap now: renames touch docs only | provisional |
| A-002 | 2026-10-29 | Free hostnames only; a paid domain needs written approval | URLs change later; edge config redo | provisional |
| A-003 | 2026-10-29 | India-first launch: INR, IST prime-time traffic shape, Razorpay test mode | Capacity model geography, payments adapter, ad formats change | provisional |
| A-004 | 2026-10-29 | UI/content languages: en + hi + mr at launch, i18n extensible | More translation work, larger i18n test matrix | provisional |
| A-005 | 2026-10-29 | Devices: evergreen desktop + Android Chrome PWA + iOS best-effort + 10-foot UI; no native apps | Player/device test matrix grows | provisional |
| A-006 | 2026-10-29 | Flagship demo = live match day (simulated) | Demo script and Phase 8 emphasis shift | provisional |
| A-007 | 2026-10-29 | Seed content = Blender open movies + FFmpeg test media + CC audio + generated data | Asset pipeline and license manifest change | provisional |
| A-008 | 2026-10-29 | Dev machine budget: this PC (8C/12T, 15.7 GB) with ~8 GB for Docker/WSL2 containers | Dev topology shrinks (compose-only, k3d optional) via ADR | provisional |

## Blocking decisions (explicitly NOT assumed)

| ID | Date | Decision | Why blocking |
|---|---|---|---|
| B-001 | 2026-10-29 | Q3 — Oracle Cloud card on file for Always Free identity check | Cost class: the brief requires explicit written approval for anything card-on-file; also changes Phase 2 infra design |
| B-002 | 2026-10-29 | Q4 — public vs private GitHub repo | Legal class: publishing code is the owner's call; determines whether zero-cost CI/CD is achievable |

## Confirmed

| ID | Date | Assumption/decision | Source |
|---|---|---|---|
| — | — | (none yet) | — |
