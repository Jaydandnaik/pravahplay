// SPIKE S2 (throwaway, non-product): Postgres event-table write rate.
// Creates a daily-partitioned event table (jsonb payloads ~500 B, as sized in 10-02),
// then hammers batched inserts from N workers for DURATION seconds.
// Usage: node load.js [workers=8] [batchRows=250] [durationSec=60]
const { Client, Pool } = require('pg');

const WORKERS = parseInt(process.argv[2] || '8', 10);
const BATCH = parseInt(process.argv[3] || '250', 10);
const DURATION = parseInt(process.argv[4] || '60', 10) * 1000;

const payload = () => JSON.stringify({
  sessionId: crypto.randomUUID(),
  titleId: crypto.randomUUID(),
  posS: Math.floor(Math.random() * 3600),
  rendition: '720p@2.5Mbps',
  isLive: Math.random() > 0.5,
  pad: 'x'.repeat(380), // pad to ~500 B realistic event size
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const setup = new Client({ connectionString: 'postgres://postgres:spike@localhost:5433/spike' });
  await setup.connect();
  await setup.query(`DROP TABLE IF EXISTS events CASCADE`);
  await setup.query(`CREATE TABLE events (
    id bigserial, at timestamptz NOT NULL DEFAULT now(),
    kind text NOT NULL, payload jsonb NOT NULL) PARTITION BY RANGE (at)`);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  for (const d of [today, tomorrow]) {
    await setup.query(`CREATE TABLE events_${d.replaceAll('-', '')}
      PARTITION OF events FOR VALUES FROM ('${d}') TO ('${d === today ? tomorrow : "9999-12-31"}')`);
  }
  await setup.end();

  const pool = new Pool({ connectionString: 'postgres://postgres:spike@localhost:5433/spike', max: WORKERS });
  const lat = [];
  let total = 0;
  const stop = Date.now() + DURATION;
  const worker = async () => {
    while (Date.now() < stop) {
      const t0 = process.hrtime.bigint();
      const values = [];
      const params = [];
      for (let i = 0; i < BATCH; i++) {
        params.push('heartbeat', payload());
        values.push(`($${params.length - 1}, $${params.length})`);
      }
      await pool.query(`INSERT INTO events (kind, payload) VALUES ${values.join(',')}`, params);
      const t1 = process.hrtime.bigint();
      lat.push(Number(t1 - t0) / 1e6);
      total += BATCH;
    }
  };
  await Promise.all(Array.from({ length: WORKERS }, worker));
  await pool.end();

  lat.sort((a, b) => a - b);
  const pct = (p) => lat[Math.min(lat.length - 1, Math.floor(p * lat.length))].toFixed(1);
  console.log(JSON.stringify({
    workers: WORKERS, batchRows: BATCH, durationSec: DURATION / 1000,
    totalRows: total, rowsPerSec: Math.round(total / (DURATION / 1000)),
    batchLatencyMs: { p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), max: lat[lat.length - 1].toFixed(1) },
    note: 'synchronous_commit=off (ingest-mode); production flushes with 5s batching so effective durability window differs',
  }, null, 2));
}
main().catch((e) => { console.error(e.message); process.exit(1); });
