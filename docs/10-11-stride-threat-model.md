# 10-11 — STRIDE Threat Model

PravahPlay · Phase 1 · 2026-10-29 · Scope: the platform as designed in 10-01; trust boundaries =
Internet↔Cloudflare, Cloudflare↔origin (k3s), cluster↔datastores, admin/advertiser RBAC surfaces,
payment provider callbacks. Risk appetite: zero-cost posture with real-user data protected to
DPDP-style baseline.

| ID | Component / boundary | Threat (STRIDE) | Scenario | Mitigation (control) | Residual risk |
|---|---|---|---|---|---|
| T1 | Client↔API | **S**poofed user | stolen access token replay | short JWT TTL (10 min), refresh rotation + reuse detection (chain revocation), device binding metadata, Turnstile on OTP | token theft within TTL window |
| T2 | OTP flow | **S** account takeover via OTP brute-force | automated code guessing | Turnstile, per-identifier + per-IP rate limits, 5-attempt lockout w/ backoff, hashed codes, 15-min expiry, email alert on lockout | SMS-mock means email-only recovery (accepted, disclosed) |
| T3 | Playback | **I**nfo disclosure — content piracy | manifest/segment URL sharing | signed ≤5-min manifest tokens (jti, session+device bound), ClearKey keys served only to entitled sessions, per-IP segment rate limit at edge, watermark-lite (session id in manifest comment) | ClearKey is not security-grade (accepted, disclosed, R12) |
| T4 | Playback | **S** entitlement bypass | free user requests premium manifest | entitlement check server-side at session creation; manifest endpoint re-checks jti→session→entitlement; entitlements cached 60 s with denylist fast-path | 60 s revocation lag for downgrades (accepted) |
| T5 | API surface | **T**ampering — parameter abuse | mass assignment, IDOR across profiles/users | Zod validation at every boundary; object ownership checks in service layer; cursor-only pagination; RFC7807 without stack traces | — |
| T6 | Admin/Ad ops | **E**levation of privilege | viewer escalates to CMS admin | RBAC (role table, no implicit role from email), separate admin auth scope claim, audit log every mutation, session re-auth (step-up PIN) for destructive ops | — |
| T7 | Advertiser portal | **R**epudiation — false campaign claims | advertiser disputes spend | append-only decision/event logs (Kafka + PG), reports computed from immutable logs, invoices versioned | — |
| T8 | Billing webhook | **S**+**T** forged callbacks | attacker injects fake payment success | HMAC signature verification, provider-event-id dedup, reconciliation job against provider API (test mode), never trust client redirect | — |
| T9 | Ads tracker | **T**+**R** beacon forgery / inflation | bot impressions | beacon ids signed + unguessable (HMAC), dedup, IVT filters (rate, impossible-speed), cohort consistency checks |Sophisticated IVT needs ML (funded-scale) |
| T10 | Kafka/Redis | **I** internal data access | compromised pod reads other tenants' events | k3s NetworkPolicies (default-deny east-west), per-service creds (PG roles per module schema), Redis ACLs per DB, no shared admin creds | single-node flat physical trust (accepted) |
| T11 | Ops consoles | **E** ops console abuse (cue/flags) | rogue ad-break / degradation flapping | admin-only RBAC + audit, flag changes rate-limited, cue console requires event-ownership claim | — |
| T12 | Secrets | **I** secret leakage | git/CI exposure | SOPS+age in-repo only, gitleaks scan in CI, age key offline, GH secrets for deploy keys only, least-priv deploy token | CI runner trust (public repo: no secrets in CI env beyond deploy-scope) |
| T13 | DoS | **D** volumetric attack | L7 flood on OTP/decision paths | Cloudflare WAF + rate limiting + Turnstile, app-level token buckets, admission control already designed for spike, fail-open ads | free WAF ruleset limits (funded: advanced) |
| T14 | DoS | **D** slowloris / resource exhaustion | connection starvation | edge terminates TLS; Node timeouts (headers, keep-alive caps), body size limits, SSE client caps per pod | — |
| T15 | Supply chain | **T** malicious dependency | compromised npm/image | lockfile + `pnpm audit` + Trivy image scan in CI, SBOM (syft), pinned digests, Renovate w/ auto-merge only for patch | 0-day window (accepted) |
| T16 | Privacy | **I** PII over-collection/exfiltration | data map violation | minimize by design (00-07 data map), first-party telemetry only, export/delete journeys, access reviews at gates | — |

Controls backlog feeding Phase 2/11: CSP+HSTS headers, ZAP baseline in CI, ASVS L2 checklist,
NetworkPolicies, Redis ACLs, per-module PG roles, audit-log immutability (append-only role),
step-up auth for admin destructive ops.
