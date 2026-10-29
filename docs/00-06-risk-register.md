# 00-06 — Risk Register

Working name: **PravahPlay** · Phase 0 · 2026-10-29 · L/I = likelihood & impact (L/M/H);
score = L×I. Reviewed at every gate.

| ID | Risk | L | I | Mitigation (owner) | Trigger / early warning | Contingency |
|---|---|---|---|---|---|---|
| R1 | Cloudflare/R2 terms restrict video delivery on free tiers | M | H | Re-read ToS clause before production reliance (COST_REGISTER action a) | Any ToS change notice | Switch origin to B2 + Bandwidth Alliance (pre-designed, ADR-0004) |
| R2 | Oracle: quota halved to 2/12, ARM capacity unavailable, or idle reclaim | H | H | Worst-case design (ADR-0005); sustained real load from own schedulers; multi-region retry; monthly re-verify | Reclaim email; capacity-out errors | Evacuate to Render/Koyeb or home server; scale-up runbook |
| R3 | 12 GB RAM ceiling squeezes datastores + observability | M | H | RAM budget table (00-04 §6); monolith-first (ADR-0003); ClickHouse deferred (ADR-0007) | Node memory-pressure alerts | Drop observability retention; move Loki remote; defer Redpanda→Redis Streams |
| R4 | Scale evidence gap — nothing free can generate 1M CCV | certain | M | Evidence classes on every claim (00-04); Phase 10 method locked now | — (accepted) | Funded-scale runbook states exactly what to buy and change |
| R5 | R2 10 GB storage cap caps catalog breadth | certain | M | Curated-catalog budget + storage-budget job + alerts (00-04 §5) | 80% storage alert | Trim secondary renditions first; B2 mirror adds 10 GB |
| R6 | Synchronized live ad-break spike melts ads-decision/tracker | M | M | Cohort-cacheable decisions (2 s TTL); beacon jitter; fail-open law | ad-decision p99 > 50 ms sustained | Fail-open (playback continues ad-free) — by design, tested in chaos |
| R7 | Uncacheable token/manifest path overwhelmed at join spike | M | H | Admission control + waiting room (Phase 8); stateless playback svc; token-path burn alerts | Token-path burn 2×/1h | Ladder D2 (00-03): queue new joiners |
| R8 | Free-tier drift (limits shrink silently, e.g., Oracle 2026) | H | M | Monthly + gate re-verification ritual; secondary-source watch (HN/changelogs) | Any limit change | Rebalance to fallback in register |
| R9 | Single-VM SPOF (no HA at free tier) | M | H | Nightly restore-tested backups; WAL to R2; DR drill with measured RTO/RPO (Phase 10) | Node down | Restore to fallback compute; RTO ≤ 30 min target |
| R10 | Windows/WSL2 dev friction (FFmpeg, k3d, MediaMTX) | M | M | WSL2-first docs; docker-compose parity; media tools pinned versions | Dev-env setup failures | compose-only dev; k3d optional |
| R11 | Scope magnitude vs solo capacity; bus factor = 1 | H | M | Phase gates; MoSCoW cutlines (00-02); walking-skeleton-first sequencing | Gate slippage > 1 phase | Drop Could→Should items, renegotiate at gate |
| R12 | ClearKey/AES-128 is not content-security-grade DRM | certain | L | Stated honestly in UI/docs; workflow parity (key svc, expiry, offline) | — (accepted) | Funded scale: license Widevine/FairPlay (runbook) |
| R13 | SMS OTP mocked → real signups need email | certain | L | Email OTP primary (Brevo 300/day); SMS adapter interface ready | — (accepted) | Funded scale: SMS provider (runbook) |
| R14 | Test-mode payments ≠ production payments | certain | L | Mock-gateway parity; webhook signature flows identical | — (accepted) | Funded scale: switch keys + KYC (runbook) |
| R15 | Brevo 300/day cap throttles OTP at signup spikes | M | M | Queue + backoff + clear UI retry; alert at 70% daily quota | 70% quota alert | Console-log OTP (dev posture) with disclosure; Resend fallback |
| R16 | Repo lives inside OneDrive (sync conflicts with git) | M | L | Relocate before Phase 2 (owner decision, flagged at gate) | git index.lock conflicts | Move to `C:\dev\<name>`; one-time copy |
| R17 | DPDP/GDPR compliance gap in self-handled data | L | M | Privacy posture + data map (00-07); export/delete journeys (J12); Phase 11 hardening | New data class without map entry | Add to map + retention policy before shipping |
| R18 | Brand collision emerges despite screen (e.g., unregistered prior use) | L | M | Screened candidates (00-08); registry check before public launch; rename is cheap now | Opposition/discovery | Rename via mechanical search-replace; keep brand assets parameterized |

Top 3 by score: R2 (Oracle), R1 (CDN ToS), R7/R9 (spike & SPOF at free tier) — all are direct
consequences of the zero-cost constraint and are mitigated by design, not by hope.
