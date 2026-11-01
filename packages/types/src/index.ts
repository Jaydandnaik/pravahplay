export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  uptimeS: number;
}

export interface Heartbeat {
  id: string;
  service: string;
  status: string;
  at: string;
}

export type Health = 'healthy' | 'degraded' | 'unhealthy';
