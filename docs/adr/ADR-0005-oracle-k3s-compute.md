# ADR-0005 — Production compute on Oracle Always Free k3s, bound to the 2 OCPU / 12 GB worst case

Status: **Conditional** — requires the owner's explicit approval (kickoff Q3 / B-001) before any
account is provisioned. No account will be created until then. · 2026-10-29

## Context
Verified 2026-10-29: Oracle signup requires a card for identity verification even on Always Free.
Always Free ARM was historically 4 OCPU / 24 GB total, but was **quietly halved to 2 OCPU / 12 GB
for new tenancies in mid-2026** (InfoQ Jul-2026; HN; the official docs page still shows the larger
allowance). Idle Always Free instances may be reclaimed after ~7 days of low utilization. ARM
capacity in popular regions is often unavailable.

## Options
1. **Oracle Always Free ARM, single-node k3s** — only free option that gives a real Kubernetes
   production posture (our Helm/Argo manifests then run unchanged on funded hardware).
2. Render/Koyeb free web services — no card, but 512 MB per service, sleep after 15–30 min idle,
   no k8s; the production posture becomes theater.
3. Home server + Cloudflare Tunnel — real but depends on home infrastructure and ISP terms.

## Decision (pending Q3)
Option 1, **designed for the 2/12 worst case** (00-04 §6 RAM budget); 4/24, if the tenancy
receives it, is treated as upside (enables PG replica + ClickHouse), never as a dependency.
Mitigations by design: resources pinned to Always Free SKUs; upgrades forbidden by working
agreement; sustained real utilization from our own schedulers/monitors against idle reclamation;
multi-region signup retry documented; evacuation plan to fallbacks rehearsed in Phase 10 chaos.

## Consequences
(+) True k8s production at ₹0; single fat node fits the modular monolith + datastores (ADR-0003).
(−) Single node = single failure domain (no HA at free tier — honest gap, alerted, scale-up
runbook); card-on-file requires owner approval (blocking, B-001); reclaim/availability risks
tracked in the risk register (R2).

## Cost impact / over-limit / fallback
Cost: ₹0 while pinned to Always Free SKUs; anything paid requires prior written approval by the
brief. Over-limit action: never upgrade; evacuate. Fallback: Koyeb/Render free (weak: cold starts),
home server + Tunnel.
