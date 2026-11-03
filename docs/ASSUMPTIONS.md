# ASSUMPTIONS

Working agreement §7.2: routine questions never stop work — the best-informed assumption is logged
here and work continues. Only cost, legal or irreversible decisions stop work.

Each entry records: date, the assumption, why it is reasonable, the impact if wrong, and the review
trigger. Superseded entries stay in place, marked superseded.

## Active defaults (owner instructed 2026-10-29 to proceed; per-answer overrides welcome at any gate)

| ID | Date | Assumption (default) | Impact if wrong | Status |
|---|---|---|---|---|
| A-001 | 2026-10-29 | Working brand name = **PravahPlay** (screened 2026-10-29: no web presence found; `StreamSetu`/`ChitraPlay`/`TaraStream`/`GullyPlay` all screened out as in-use; a recorded `JioHotstar` answer rejected — trademark, constraint #5). Owner ratifies at the Phase 0 gate | Cheap now: renames touch docs only | active (default) |
| A-002 | 2026-10-29 | Free hostnames only; a paid domain needs written approval | URLs change later; edge config redo | active (default) |
| A-003 | 2026-10-29 | India-first launch: INR, IST prime-time traffic shape, Razorpay test mode | Capacity model geography, payments adapter, ad formats change | active (default) |
| A-004 | 2026-10-29 | UI/content languages: en + hi + mr at launch, i18n extensible | More translation work, larger i18n test matrix | active (default) |
| A-005 | 2026-10-29 | Devices: evergreen desktop + Android Chrome PWA + iOS best-effort + 10-foot UI; no native apps | Player/device test matrix grows | active (default) |
| A-006 | 2026-10-29 | Flagship demo = live match day (simulated) | Demo script and Phase 8 emphasis shift | active (default) |
| A-007 | 2026-10-29 | Seed content = Blender open movies + FFmpeg test media + CC audio + generated data | Asset pipeline and license manifest change | active (default) |
| A-008 | 2026-10-29 | Dev machine budget: this PC (8C/12T, 15.7 GB) with ~8 GB for Docker/WSL2 containers | Dev topology shrinks (compose-only, k3d optional) via ADR | active (default) |

## Blocking decisions — RESOLVED 2026-10-29 ("Continue with default" instruction)

| ID | Date | Decision | Source |
|---|---|---|---|
| B-001 | 2026-10-29 | **APPROVED** — card on file for Oracle Always Free signup; Always Free SKUs only; upgrades forbidden without prior written approval. Provisioning happens in Phase 2. | Owner: "Continue with default or what you like to keep" |
| B-002 | 2026-10-29 | **APPROVED** — one public GitHub repository (code + docs only; SOPS-encrypted secrets only; no user data, ever) | Owner: "Continue with default or what you like to keep" |

## Confirmed

| ID | Date | Assumption/decision | Source |
|---|---|---|---|
| C-001 | 2026-10-29 | Brand = **PravahPlay** (screened clean; owner ratifies default) | Owner default acceptance |
| C-002 | 2026-10-29 | Free hostnames only (pages.dev + sslip.io/Let's Encrypt); paid domain stays rejected without written approval | Owner default acceptance |
| C-003 | 2026-10-29 | India-first, en/hi/mr, evergreen browsers + 10-foot UI, live match-day flagship demo, Blender/CC seed content, this dev PC (~8 GB container budget) | Owner default acceptance |
| C-004 | 2026-10-29 | Repo location stays in OneDrive through Phase 1; relocate before Phase 2 public repo creation (risk R16) | Owner default acceptance (relocation pending) |

| A-009 | 2026-11-01 | Dev machine shadows common ports (8080 = Jenkins, 5432 = shadowed listener); dev topology uses host ports 5434 (PG) and 8090 (API) | Only dev-local; production ports are container-internal | active |

| A-010 | 2026-11-03 | This machine's DNS resolves `host.docker.internal` to a LAN IP (10.39.x); k3d kubeconfig patched to 127.0.0.1 locally | Dev-machine only; Oracle VM provisioning is unaffected (no docker-desktop DNS layer) | active |
