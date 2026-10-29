# 00-05 — Cost Register Snapshot (Phase 0)

Frozen snapshot of `docs/COST_REGISTER.md` as verified on **2026-10-29**. The living register is
the canonical file; this snapshot preserves the Phase 0 baseline. Headlines of this pass:

1. **Oracle Always Free was halved to 2 OCPU / 12 GB for new tenancies in mid-2026** — the whole
   production design binds to this worst case (ADR-0005, 00-04 §6).
2. **R2's 10 GB free storage caps the demo catalog at ~2.3 hours of full-ladder content** — the
   curated-catalog budget in 00-04 §5 is a hard design constraint, not a preference.
3. Class B origin-read budget (~3.85 req/s sustained) bounds free-tier sustained concurrency to
   ≈2.3k CCV @99% CDN hit / ≈23k @99.9% — our live targets sit far below.
4. Upstash's free tier (256 MB / 500K cmd/mo) is too small to be anything but an evacuation
   fallback — self-hosted Redis is the only viable primary (ADR-0006).
5. Zero-cost CI/CD requires a **public** GitHub repo (Q4/B-002 still awaiting explicit owner
   confirmation).

See the living register for the full table, sources and confidence classes.
