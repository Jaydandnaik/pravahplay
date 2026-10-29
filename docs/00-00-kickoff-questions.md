# 00-00 — Kickoff Questions (Phase 0)

Issued 2026-10-29. Each question has a proposed default. Answer inline (e.g. "3: yes, 5: global")
or reply "defaults" to accept all of them. Unanswered non-blocking questions fall back to their
defaults, recorded in `docs/ASSUMPTIONS.md`.

**Blocking (decision-class, work waits):** Q3 (cost), Q4 (legal).
**Non-blocking:** Q1, Q2, Q5–Q10.

> **Answer record — 2026-10-29:** Owner instructed "Move to next step": all non-blocking defaults
> accepted provisionally. **Q3 and Q4 remain OPEN** and require explicit written confirmation
> before any Phase 2 account provisioning; Phase 0 is documents-only, so work proceeds.
>
> **Q1 anomaly:** an answer `JioHotstar` was recorded in this file. It is **rejected as the brand**:
> constraint #5 of the brief forbids JioHotstar/Jio/Disney names (registered trademarks of the
> JioStar group) and requires original branding. The brand decision stays open; the screened
> default and alternates are in `00-08-brand.md`.

---

## Q1 — Brand name *(non-blocking; docs use the default as working name)*

**Default: StreamSetu** ("setu" = bridge; short, pronounceable, original). Alternates on the table:
**ChitraPlay**, **TaraStream**, **GullyPlay**. Phase 0 runs a web/trademark quick-screen on the
chosen name and delivers an SVG wordmark concept in `00-08-brand.md`. Final pick is yours at the
gate.

Answer: `JioHotstar` — ⚠️ **rejected** (trademark conflict with constraint #5); awaiting a lawful
original name. Note: screening on 2026-10-29 found **StreamSetu is already in use**
(streamsetu.com, a Jaipur-based live-streaming service, same industry) — screened out. See
`00-08-brand.md` for screened alternates.

## Q2 — Domain strategy *(non-blocking)*

**Default: free hostnames only.** Web at `<brand>.pages.dev`; production API on the Oracle VM's
public IP using `sslip.io` DNS + Let's Encrypt TLS. A real registrable domain (≈ ₹1,000/yr) is
deliberately deferred and would require explicit written approval before purchase.

Answer: `____________________`

## Q3 — Oracle Cloud Always Free signup card *(BLOCKING — cost class)*

Oracle Cloud is the only genuinely usable free compute for a k3s production cluster (up to 4 OCPU /
24 GB ARM total, subject to availability and idle-reclamation rules). **Signup requires a payment
card for identity verification even on Always Free.** It is never billed unless deliberately
upgraded; the tenancy will be pinned to Always Free SKUs only, and upgrades are forbidden by the
working agreement.

**Default / approval requested: card on file, Always Free only.**
If declined: fallback is Render/Koyeb free tiers (no card, but no Kubernetes, cold starts, weak
for a production posture) or a home server + Cloudflare Tunnel. The choice changes the Phase 2
infrastructure design, so it must be settled now.

Answer: `____________________`

## Q4 — Repository visibility *(BLOCKING — legal class)*

**Default: one public GitHub repository.** Public gives unmetered GitHub Actions minutes and free
GHCR container hosting — both essential to zero-cost CI/CD. Repo holds code + docs only; secrets
only ever SOPS-encrypted; no real user data in the repo, ever.
If private: CI drops to ~2,000 Actions minutes/month and registry storage becomes metered —
workable but tight; the pipeline plan would be reworked accordingly.

Answer: `____________________`

## Q5 — Launch geography & currency *(non-blocking)*

**Default: India-first.** INR price points, IST prime-time traffic shape in the capacity model,
Razorpay test mode for payments, and a cricket-style match-day spike as the load archetype — all
served over Cloudflare's global edge regardless of geography.

Answer: `____________________`

## Q6 — Languages *(non-blocking)*

**Default: English + Hindi + Marathi at launch** (UI, metadata, editorial copy), with the i18n
framework extensible to ta/te/bn/gu and more. Content audio-track count is independent of UI
language.

Answer: `____________________`

## Q7 — Target devices *(non-blocking)*

**Default: evergreen browsers (last two versions)** — desktop, Android Chrome as an installable
PWA, iOS Safari best-effort — plus a TV-style 10-foot UI navigable by keyboard/D-pad emulation.
No native apps (per the brief).

Answer: `____________________`

## Q8 — Flagship demo scenario *(non-blocking)*

**Default: live match day.** A simulated sports event with a 60-second zero-to-N admission spike,
waiting room, match center, and a live server-side-inserted ad break. It exercises the hardest
patterns (spike, admission control, degradation ladder); VOD and the ads platform get equal
engineering depth, but the final demo script anchors on match day.

Answer: `____________________`

## Q9 — Seed content *(non-blocking)*

**Default: Blender open movies** (Big Buck Bunny, Sintel, Tears of Steel, Cosmos Laundromat,
Elephants Dream), **FFmpeg-generated test patterns and the simulated sports loop**,
**CC-licensed audio**, and generated scoreboard/commentary data. Self-made media, if any, gets
priority in the catalog.

Answer: `____________________`

## Q10 — Dev machine budget *(non-blocking; detected 2026-10-29)*

Detected: 12th Gen Intel Core i5-12450H — 8 cores / 12 threads, 15.7 GB RAM, Windows 11 + Git
Bash, git 2.45.2 with identity configured.
**Default: this machine, Docker Desktop with WSL2, ~8 GB RAM for the dev container topology**
(Postgres, Redis, Redpanda, k3d, media tools). At 16 GB total this is comfortable; if RAM pressure
appears, the dev topology shrinks to docker-compose-only (k3d optional) by ADR.

Answer: `____________________`
