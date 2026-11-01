import pino from 'pino';

export type Logger = pino.Logger;

export interface LoggerOptions {
  service: string;
  level?: string;
  pretty?: boolean;
  base?: Record<string, unknown>;
}

export function createLogger({ service, level = 'info', pretty = false, base }: LoggerOptions): Logger {
  return pino({
    level,
    base: { service, ...base },
    formatters: { level: (label) => ({ level: label }) },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(pretty
      ? { transport: { target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname,service' } } }
      : {}),
  });
}
