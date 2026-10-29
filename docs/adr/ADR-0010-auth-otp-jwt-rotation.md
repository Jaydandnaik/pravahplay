# ADR-0010 — AuthN/AuthZ: OTP-first identity, JWT access + rotating refresh chains

Status: Accepted (Phase 1, 2026-10-29)

## Context
Phone/email OTP login (brief §4), multiple profiles, kids gating, device limits. No password store
is desirable (reduces attack surface; SMS is mocked so phone OTP is email-real only at zero cost).
Zero-cost identity providers (Auth0 et al.) have too-small free tiers for this platform.

## Options
1. **In-house: hashed OTP (15 min) → session + JWT access (10 min) + rotating refresh (HttpOnly
   cookie, hashed at rest, chain with reuse detection)**.
2. Third-party identity (Clerk/Auth0/Supabase Auth) — free tiers cap MAUs below design targets and
   add an external dependency to the auth path.

## Decision
Option 1. Sessions carry device metadata; logout-everywhere = revoke session set; refresh reuse
detection revokes the whole chain (audit-logged). RBAC: user, profile-context, admin role table
(separate claim), advertiser role. Step-up PIN for destructive admin ops. Rate limits + Turnstile
at OTP paths. 15-min OTP window, 5-attempt lockout with backoff.

## Consequences
(+) Full control, zero marginal cost, fits threat model T1/T2/T6 (10-11).
(−) We own the security of the auth path (mitigated: ASVS L2 checklist, ZAP, gitleaks, audits;
auth module gets the strictest review + test coverage gates).

## Cost impact / over-limit / fallback
Zero. Over-limit: none. Fallback: Supabase Auth free tier for a staged evacuation if a critical
in-house flaw is found (documented in RB-07).
