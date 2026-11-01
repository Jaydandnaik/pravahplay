export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}

/** Input shape: `type` optional (derived from title when omitted); extra keys allowed. */
export type ProblemInput = {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
};

export class AppError extends Error {
  readonly problem: ProblemDetails;

  constructor(problem: ProblemInput) {
    super(problem.detail ?? problem.title);
    this.name = new.target.name;
    this.problem = {
      ...problem,
      type: problem.type ?? `https://pravahplay.dev/problems/${slug(problem.title)}`,
    };
  }
}

export class NotFoundError extends AppError {
  constructor(detail = 'Resource not found') {
    super({ title: 'Not Found', status: 404, detail });
  }
}

export class ValidationError extends AppError {
  constructor(detail = 'Request validation failed', extra?: Record<string, unknown>) {
    super({ title: 'Validation Failed', status: 400, detail, ...extra });
  }
}

export class UnauthorizedError extends AppError {
  constructor(detail = 'Authentication required') {
    super({ title: 'Unauthorized', status: 401, detail });
  }
}

export class ConflictError extends AppError {
  constructor(detail = 'Conflict with current state') {
    super({ title: 'Conflict', status: 409, detail });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(detail = 'Rate limit exceeded', retryAfterS?: number) {
    super({ title: 'Too Many Requests', status: 429, detail, retryAfterS });
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

function slug(title: string): string {
  return title.toLowerCase().replaceAll(' ', '-');
}
