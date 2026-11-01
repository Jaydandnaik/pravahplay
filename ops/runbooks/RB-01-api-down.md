# RB-01 — pravah-api down

Symptoms: `ApiDown` / `ApiHighErrorRate` alerts; play-probe failing.

1. Check pod/deploy: `kubectl -n pravah get pods -l app=pravah-api` (prod) or `docker ps` (dev).
2. `kubectl -n pravah logs deploy/pravah-api --tail=100` — OOM? CrashLoop? DB unreachable?
3. If a bad deploy: `argocd app rollback pravah` or `helm rollback pravah` (Phase 2 exit criterion).
4. If Postgres: run RB-02 first; API should return 503 on /readyz but stay alive on /healthz.
5. Escalate to degradation ladder D1 (feature flags off) if user-facing impact persists >5 min.
