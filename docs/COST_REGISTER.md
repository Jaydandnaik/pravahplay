# COST REGISTER

Constraint #1: strictly zero cost. No resource that can bill. Every external service below must
stay inside its permanently-free allowance. The **over-limit action** is decided *before* the
service is relied on, and every primary has a **free fallback** that is exercised at least once
before the primary is depended on in production.

**Verification ritual:** every row is re-verified at each phase gate and monthly. Each verification
records the date and the source URL. Stale knowledge — including model training data — never counts
as verification; limits are re-read from provider documentation at verification time.

Legend: Status = VERIFIED (date) | UNVERIFIED | CHANGED (needs action)

| # | Service | Purpose | Free limit (source + date) | Expected peak usage (capacity-model ref) | Over-limit action | Free fallback | Status |
|---|---------|---------|---------------------------|------------------------------------------|--------------------|---------------|--------|
| 1 | Cloudflare DNS / TLS / WAF / CDN cache | Edge security and content caching | TBD — verify | See `00-04` edge tier | n/a (this IS the fallback layer for origin) | n/a | UNVERIFIED |
| 2 | Cloudflare Pages | Frontend hosting: web, admin, advertiser portals | TBD — verify | 3 small static apps | Swap CI deploy target | Netlify free; GitHub Pages | UNVERIFIED |
| 3 | Cloudflare R2 | Media storage + WAL archives (zero egress fees) | TBD — verify | Ladder storage math in `00-04` | Pause uploads; verify ToS video-delivery clause before production reliance | Backblaze B2 behind Cloudflare (Bandwidth Alliance) | UNVERIFIED |
| 4 | Cloudflare Turnstile | Bot protection on auth + public forms | TBD — verify | Low (auth paths only) | Degrade to rate-limit-only | Rate limits only | UNVERIFIED |
| 5 | Oracle Cloud Always Free | Production compute: k3s on ARM VM(s) | TBD — verify (≤4 OCPU / 24 GB total; availability + idle-reclaim rules) | Lab-scale production (~small) | Never upgrade without written approval; evacuate to fallback | Koyeb/Render free; home server + Cloudflare Tunnel | UNVERIFIED |
| 6 | GitHub Actions | CI/CD pipelines | TBD — verify (public-repo allowance) | Minutes budgeted per pipeline in Phase 2 plan | Trim CI, cache aggressively, merge jobs | GitLab CI free tier | UNVERIFIED |
| 7 | GHCR | Container registry | TBD — verify (public-repo storage/egress) | A few GB of multi-service images | Prune untagged/old images | Docker Hub free (verify limits) | UNVERIFIED |
| 8 | Brevo | Transactional email + OTP | TBD — verify (daily send cap) | OTP peaks modeled in `00-04` | Queue and drain; alert | Resend free tier; console provider in dev | UNVERIFIED |
| 9 | Upstash | Redis fallback only (self-hosted is primary) | TBD — verify | n/a | n/a | Self-hosted Valkey on VM | UNVERIFIED |
| 10 | Neon / Supabase | Staging Postgres (fallback; self-hosted is primary) | TBD — verify | Staging only | Accept staging pause/sleep | Self-hosted Postgres on VM | UNVERIFIED |
| 11 | Firebase Cloud Messaging | Push notifications | TBD — verify current policy | Low | Web Push (VAPID) only | Web Push (VAPID) | UNVERIFIED |
| 12 | Razorpay / Stripe — TEST MODE | Payment simulation (no real money) | Free test mode | n/a | Switch to mock gateway | Mock gateway (built in Phase 6) | UNVERIFIED |
| 13 | Telegram Bot API | Alertmanager notification channel | Free (verify) | Trivial | Email alerts | Email via Brevo | UNVERIFIED |
| 14 | Grafana Cloud free / Sentry free tier | Observability + error-tracking fallbacks | TBD — verify | n/a while self-hosted stack fits the VM | Keep self-hosted primary | Self-hosted Prometheus/Grafana/Loki/Tempo + GlitchTip | UNVERIFIED |

All rows UNVERIFIED as of 2026-10-29. The first full verification pass (source URL + date per row)
is a Phase 0 execution task. Free-tier limits drift; treat every number older than 30 days as
suspect.
