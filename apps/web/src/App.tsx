import { useEffect, useState } from 'react';

interface Health {
  status: string;
  service: string;
  version: string;
  uptimeS: number;
}

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/healthz')
      .then((r) => {
        if (!r.ok) throw new Error(`healthz ${r.status}`);
        return r.json();
      })
      .then(setHealth)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main style={styles.main}>
      <div style={styles.tile} aria-hidden>
        <span style={styles.wave1}>〜</span>
        <span style={styles.wave2}>〜</span>
        <span style={styles.wave3}>▶</span>
      </div>
      <h1 style={styles.h1}>
        PRAVAH<span style={styles.accent}>PLAY</span>
      </h1>
      <p style={styles.tag}>Every screen, one flow</p>
      <p style={styles.status} role="status">
        {error
          ? `API unreachable: ${error}`
          : health
            ? `API ${health.status} — ${health.service}@${health.version} (up ${health.uptimeS}s)`
            : 'checking API…'}
      </p>
    </main>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: '#14162B',
    color: '#F6F7FB',
    fontFamily: 'system-ui, sans-serif',
    gap: 8,
  },
  tile: { fontSize: 34, letterSpacing: 6 },
  wave1: { color: '#2EC4B6' },
  wave2: { color: '#F6F7FB' },
  wave3: { color: '#FF9F1C' },
  h1: { fontSize: 42, letterSpacing: 4, margin: 0 },
  accent: { color: '#FF9F1C' },
  tag: { letterSpacing: 6, color: '#8A90B8', margin: 0 },
  status: { marginTop: 24, fontSize: 14, color: '#2EC4B6' },
};
