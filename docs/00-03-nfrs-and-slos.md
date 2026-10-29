# 00-03 — Non-Functional Requirements and SLOs

Working name: **PravahPlay** · Phase 0 · 2026-10-29

## Service-level objectives

Numbers refine the brief §10. All SLOs are measurable, alertable (burn-rate), and re-baselined at
the Phase 10 gate with load-test evidence.

| SLO | Target | Measurement | Error budget (30d) |
|---|---|---|---|
| Playback path availability (token→manifest→first segment) | 99.9% | synthetic probe + QoE | 43.2 min |
| Browse/rails API latency | p95 < 200 ms (edge-cached p95 < 100 ms) | RED metrics | budget-shared |
| VOD time-to-first-frame | p95 < 2 s on 4G profile | QoE telemetry | 43.2 min equiv |
| Rebuffer ratio | < 0.5% of playtime | QoE telemetry | — |
| Live join (admitted viewer) → first frame | p95 < 3 s | QoE telemetry | — |
| Ad decision latency | p99 < 50 ms (in-memory index) | RED metrics | fail-open = no user impact |
| Auth (OTP request→verify) | p95 < 500 ms excl. email delivery | RED metrics | — |
| Web LCP | < 2.5 s (enforced bundle budget: initial JS ≤ 250 KB gz) | Lighthouse CI in pipeline | — |
| API error rate (5xx, non-shed) | < 0.1% | RED metrics | — |

Error-budget policy: when a service exhausts its 30-day budget, feature work on that service
pauses until the budget recovers (gate-enforced; chaos/load findings exempt).

## Degradation ladder (D0–D4) — the contract that playback never dies

| Level | Trigger | What turns off / changes | Never touched |
|---|---|---|---|
| D0 normal | — | — | — |
| D1 | token-path burn 2×/1h | reactions, personalization rails → static, hover trailers | playback, auth |
| D2 | token-path burn 4×/1h | new joiners → waiting room; DVR window shortened | admitted playback |
| D3 | origin egress climbing / hit-ratio drop | max-bitrate cap 720p cohort manifests; telemetry sampling ↓ | admitted playback |
| D4 | partial region loss | static fallback rails, reduced ladder, queue admissions | playback (multi-region at funded scale; single-region today = honest gap) |

## Security (targets; full checklist Phase 11)

- OWASP ASVS L2; ZAP baseline scan in CI; dependency + container scanning (Trivy) with gate.
- Secrets: SOPS + age, sealed into the cluster; zero secrets in repo history (enforced by gitleaks).
- Playback URLs: signed, short-lived (≤ 5 min manifest tokens), bound to session + device.
- Rate limits on every public endpoint; Turnstile on OTP + login.
- RBAC everywhere (user profiles, CMS, ad-ops, advertiser portal); audit log for admin actions.
- CSP, HSTS, frame-ancestors 'none'; cookies: HttpOnly, Secure, SameSite=Lax.

## Privacy (DPDP-style + GDPR-style posture)

- Consent log at signup; purpose-limited data; data map maintained in `docs/00-07`.
- Export + delete self-service (J12); delete cascades within 30 days incl. backups documented.
- Retention: QoE 90d, ad events 180d (aggregates kept), audit logs 1y, OTP codes 15 min.
- No third-party trackers; all telemetry first-party.

## Durability & recovery targets

- RPO ≤ 5 min (continuous WAL archiving to R2), RTO ≤ 30 min (restore drill measured in Phase 10).
- Postgres: nightly base backup + WAL-G; backups restore-tested monthly (automated job + report).
- Single-VM reality: no HA at free tier — documented, alerted, and reversible (scale-up runbook).

## Accessibility & i18n

- WCAG 2.2 AA on web + admin; 10-foot UI focus-visible everywhere; keyboard-complete.
- i18n: en/hi/mr at launch, ICU messages, RTL-ready framework, translated metadata fallback chain.

## Engineering NFRs (Definition-of-Done enforcement)

- TypeScript strict; Zod at every boundary; RFC 7807 errors; cursor pagination; idempotency keys on
  unsafe POSTs; OpenAPI per service; contract tests (Pact) at service seams.
- RED + USE metrics, structured JSON logs with trace-ID propagation (HTTP + Kafka), OTel SDK in
  every service; dashboards-as-code committed under `ops/`.
- Every deployable: health/readiness probes, preStop drain, config via env (12-factor).
- Test gates: unit ≥ 80% on domain logic; integration via Testcontainers; e2e Playwright smoke per
  gate; k6 suites in `ops/load` with results committed.
