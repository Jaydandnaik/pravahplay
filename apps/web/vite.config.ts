import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/v1': 'http://localhost:8090',
      '/healthz': 'http://localhost:8090',
      '/readyz': 'http://localhost:8090',
    },
  },
  build: { sourcemap: true },
});
