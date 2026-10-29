# COST REGISTER

Constraint #1: strictly zero cost. No resource that can bill. Every external service below must
stay inside its permanently-free allowance. The **over-limit action** is decided *before* the
service is relied on, and every primary has a **free fallback** exercised at least once before the
primary is depended on in production.

**Verification ritual:** re-verify at each phase gate and monthly; record date + source; stale
knowledge (including model training data) never counts. Confidence: **official** = provider page
read this pass · **secondary** = consistent third-party sources · **weak** = needs re-check.

Last full verification: **2026-10-29** (Phase 0).

| # | Service | Purpose | Free limit (verified 2026-10-29) | Expected peak usage (00-04) | Over-limit action | Free fallback | Confidence |
|---|---------|---------|----------------------------------|------------------------------|--------------------|---------------|------------|
| 1 | Cloudflare free plan (DNS/TLS/WAF/CDN) | Edge security + caching | Free tier incl. unmetered static caching (re-read plan page at Phase 2) | Edge tier (00-04 §2) | n/a — this is the fallback layer | — | secondary |
| 2 | Cloudflare Pages | Web/admin/advertiser hosting | Unlimited bandwidth & requests; 500 builds/mo | 3 small static apps; ≤ 40 builds/mo | Cache builds; direct-upload fallback | Netlify free (100 GB/mo bw); GitHub Pages | secondary |
| 3 | Cloudflare R2 | Media + WAL storage | **10 GB storage; 1M Class A/mo; 10M Class B/mo; egress ₹0** | Catalog budget 10.0 GB (00-04 §5); ops budget ≈3.85 req/s | Storage-budget job blocks uploads; 80/95% quota alerts; **verify ToS video clause before prod** | Backblaze B2 + Bandwidth Alliance | secondary (consistent) |
| 4 | Cloudflare Turnstile | Bot protection | Free; 20 widgets/sitekeys | 2 widgets | Rate-limit-only mode | hCaptcha free (verify) | secondary |
| 5 | Oracle Cloud Always Free | Production compute (k3s) | **Halved mid-2026 for new tenancies: 2 OCPU / 12 GB ARM** (docs still cite 4/24); card required at signup; idle reclaim ~7d | Worst-case budget 00-04 §6 | Never upgrade; evacuate | Koyeb/Render free; home server + Tunnel | secondary (InfoQ Jul-2026 + HN) |
| 6 | GitHub Actions | CI/CD | **Public repo: free minutes**; private: 2,000 min/mo | ≤ 300 min/mo est. | Trim/cache/merge jobs | GitLab CI free | official (changelog) |
| 7 | GHCR | Container registry | Free storage/egress for public images | Few GB; prune old tags | Prune untagged | Docker Hub free (verify limits) | secondary — re-check at Phase 2 |
| 8 | Brevo | Email OTP/transactional | **300 emails/day** (no rollover); 100k contacts; Brevo branding | ≤ 200/day modeled | Queue + alert; retry/backoff UI | Resend free; console provider (dev) | official (help center) |
| 9 | Upstash Redis | Fallback only | 256 MB; 500K commands/mo; 10 GB bw | n/a (self-hosted primary) | n/a | self-hosted primary | official |
| 10 | Neon | Staging PG fallback | 0.5 GB; 100 CU-hrs/mo; 5-min autosuspend | Staging only | Accept suspend | Self-hosted PG | secondary |
| 11 | Supabase | Staging PG fallback | 500 MB; read-only over limit; 7-day inactivity pause | Staging only | Keep-alive ping job or accept | Self-hosted PG | secondary |
| 12 | Backblaze B2 | Media fallback | 10 GB; egress free up to 3× avg storage; **unlimited free via Cloudflare** | Mirror of R2 layout | Same budget job | (this is the fallback) | official |
| 13 | Render / Koyeb | Compute fallback | Render: 750 hrs/mo, 512 MB, 15-min spin-down; Koyeb: 1 svc, ~512 MB, sleeps | Evacuation only | n/a | home server + Tunnel | secondary |
| 14 | Grafana Cloud free | Observability fallback | 10k series; 50 GB logs; 50 GB traces; 3 users; 14-day retention | n/a while self-hosted fits | Keep self-hosted primary | self-hosted stack | official |
| 15 | Sentry free | Error-tracking fallback | 5k errors/mo; 1 user; 30-day retention | n/a (GlitchTip primary) | Keep GlitchTip | GlitchTip self-hosted | official |
| 16 | FCM | Push | Free; ~100k msgs/day/project | ≤ 1k/day | Web Push only | Web Push (VAPID) | official+secondary |
| 17 | Telegram Bot API | Alerts | Free; ~30 msg/s, 1/s per chat | Trivial | Email alerts | Brevo email | secondary |
| 18 | Razorpay/Stripe TEST | Payments sim | Free test mode; no real money | n/a | Mock gateway (Phase 6) | Mock gateway | official |

Open actions: (a) re-read Cloudflare/R2 ToS video-delivery clause before production reliance;
(b) re-read Oracle Always Free page at signup (quota uncertainty 2/12 vs 4/24); (c) confirm GHCR
public-repo terms at first push; (d) owner approvals B-001 (Oracle card) and B-002 (public repo)
before Phase 2 provisioning.
