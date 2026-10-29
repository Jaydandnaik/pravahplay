# ADR-0007 — Redpanda + Postgres outbox; Postgres partitions before ClickHouse

Status: Accepted (Phase 0, 2026-10-29)

## Context
Event backbone needed for: analytics pipeline, ad events (Kafka topics ad.requests/decisions/
events per brief §9), outbox-driven integration events, CQRS read-model refresh. ClickHouse OSS
is the eventual analytics store, but RAM on the worst-case VM is fully allocated (00-04 §6).

## Options
1. **Redpanda (Kafka API, KRaft, single node, heap-capped) + transactional outbox from Postgres**;
   analytics events land in **monthly-partitioned Postgres tables** until volume justifies
   ClickHouse.
2. Kafka JVM ZooKeeper — heavier than the VM budget.
3. Redis Streams as backbone — simpler, but weaker durability/replay semantics for an event spine.

## Decision
Option 1. Outbox pattern: services commit domain changes + outbox row in one Postgres transaction;
a relay publishes to Redpanda with at-least-once + idempotent consumers (inbox pattern).
ClickHouse adoption is an explicit future ADR gated on measured event volume (estimate: when ad
events sustain > ~500 inserts/s or analytics queries degrade past SLO).

## Consequences
(+) Event spine in place from day one (CQRS, analytics, ads all hang off it); Postgres partitions
reuse existing backup/ops; RAM budget preserved.
(−) Single Redpanda node = no broker HA (accepted at free tier, honest gap); analytics queries on
Postgres are slower than ClickHouse (acceptable at lab scale; partition-drop retention keeps tables
small); relay adds ~1 s latency to event visibility (fine for our consumers).

## Cost impact / over-limit / fallback
Zero. Over-limit: disk on VM — retention by partition drop; Redpanda topic retention sized in days.
Fallback: NATS JetStream or Redis Streams if RAM pressure demands (pre-designed topic-name mapping).
