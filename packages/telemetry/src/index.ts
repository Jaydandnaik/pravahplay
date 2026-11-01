import client from 'prom-client';

export type Registry = client.Registry;

export function createMetricsRegistry(service: string): Registry {
  const registry = new client.Registry();
  registry.setDefaultLabels({ service });
  client.collectDefaultMetrics({ register: registry });
  return registry;
}

export function createHttpMetrics(registry: Registry) {
  const durations = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
    registers: [registry],
  });
  return {
    observe(method: string, route: string, status: number, seconds: number) {
      durations.labels(method, route, String(status)).observe(seconds);
    },
  };
}

export interface TracingConfig {
  serviceName: string;
  enabled: boolean;
  otlpEndpoint?: string;
}

/** Starts the OTel SDK when enabled; never throws — observability must not take down the app. */
export async function startTracing({ serviceName, enabled, otlpEndpoint }: TracingConfig): Promise<void> {
  if (!enabled || !otlpEndpoint) return;
  try {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const sdk = new NodeSDK({
      serviceName,
      traceExporter: new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` }),
      instrumentations: [getNodeAutoInstrumentations()],
    });
    sdk.start();
    process.on('SIGTERM', () => void sdk.shutdown());
  } catch (err) {
    // Tracing failure is never fatal; surface it once on stderr.
    console.error('[telemetry] failed to start tracing', err);
  }
}
