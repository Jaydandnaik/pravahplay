# 10-10 — Backup & Disaster Recovery

PravahPlay · Phase 1 · 2026-10-29 · Targets from 00-03: **RPO ≤ 5 min, RTO ≤ 30 min** (measured in
Phase 10 drills).

## What is backed up, where, how

| Data | Method | Schedule | Destination | Restore path |
|---|---|---|---|---|
| Postgres | WAL-G: continuous WAL archiving + nightly base backup (pg_basebackup, compressed) | WAL every ~60 s of activity; base nightly 02:30 IST | R2 bucket `pravah-backup` (versioned) | `wal-g backup-fetch` + replay to PITR |
| Postgres logical subset | pg_dump per schema | weekly (belt-and-braces, small) | same bucket | psql restore |
| Valkey | RDB snapshots + AOF | RDB 5 min, AOF 1 s | PV only (reconstructible: sessions/caches; BullMQ queue snapshot) | restart from snapshot; queue jobs re-enqueued by idempotent producers |
| Redpanda | topic data = derived/ephemeral; **source of truth is PG outbox/partitions** | n/a | n/a (recreate topics via IaC; replay from outbox if lag window lost) | topic recreate + catch-up |
| R2 media | versioning ON; lifecycle guard | continuous | R2 versioning | object version restore |
| R2 WAL/backup bucket | cross-check checksums weekly | weekly | same bucket (accepted single-cloud risk; funded scale → B2 mirror) | n/a |
| Cluster state | everything declarative (OpenTofu/Ansible/Helm/Argo) | git | GitHub | `argocd app sync` to fresh node |
| Secrets | SOPS+age encrypted in git; age private key **offline** (password manager) | on change | git + offline | decrypt into fresh cluster |

## DR scenarios

1. **Pod/workload loss** (k8s heals): automatic; Argo resyncs.
2. **Node loss** (VM rebuild): provision new VM via Ansible → k3s join → Argo sync → restore PG
   from WAL-G → re-key secrets → DNS flip. Drilled as the Phase 10 DR exercise; target ≤ 30 min.
3. **Bad deploy**: Argo rollback (history 5) or git revert; PG migrations must be backward-
   compatible one phase (expand→migrate→contract) so rollback never needs DB rollback.
4. **Data corruption**: PITR to pre-corruption marker; outbox replay fills read models.
5. **Region/account loss** (worst case): re-provision on fallback compute (Koyeb/Render posture is
   degraded-mode; documented, not equal-SLA) — honest gap at zero cost.

## Guardrails

- Restore drill = monthly automated job: restore latest base+WAL into a scratch container, run
  smoke SQL + row-count checks, report to Telegram. **A backup is only real after a restore.**
- Backup job success is an SLO-bearing metric (alert on first miss).
- Deletion safety: PG drops are soft-delete first; partition drops only for partitions > N days and
  after rollup checksum match; R2 deletes require receipts (media pipeline) and bucket versioning
  guards accidental mass delete.
