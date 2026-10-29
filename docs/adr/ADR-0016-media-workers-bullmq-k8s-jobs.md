# ADR-0016 — Media workers: BullMQ dispatch + k8s Jobs execution with FFmpeg image

Status: Accepted (Phase 1, 2026-10-29)

## Context
Transcode/packaging must not run in the API process (ADR-0001 consequence) and must not exceed the
VM's RAM. Jobs are bursty (catalog ingest) but concurrency 1 at free tier (00-04 §6).

## Options
1. **BullMQ queue (Redis DB2) dispatches; each job runs as a k8s Job** using a dedicated FFmpeg +
   Shaka Packager image with resource limits; worker pod only orchestrates.
2. Long-lived worker pods running FFmpeg as child processes — simpler, but a crashed transcode can
   destabilize the worker; limits less precise.

## Decision
Option 1. Job spec: cpu 2, mem 2 Gi (720p cap at 1.5 Gi if OOM observed — retry ladder downgrade
per 10-05). Progress reported via BullMQ job events. Jobs write to a staging R2 prefix; publish is
atomic (10-05). On node restart, orphaned Jobs are garbage-collected by the orchestrator worker.

## Consequences
(+) Hard isolation of FFmpeg crashes; precise resource caps; retry semantics at job level.
(−) Job startup latency (image pull ~seconds on local node — images pre-pulled by DaemonSet-style
warmup); slightly more k8s machinery (RBAC for Job creation — least-priv ServiceAccount).

## Cost impact / over-limit / fallback
Zero. Fallback: Option 2 (in-worker child processes) if k8s Job RBAC proves operationally fragile —
decision reversible without schema changes (queue contract unchanged).
