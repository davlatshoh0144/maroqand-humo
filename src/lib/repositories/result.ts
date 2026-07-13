export type RepositoryErrorCode =
  | 'AUTH_ERROR'
  | 'BACKEND_SETUP_REQUIRED'
  | 'CONFIG_ERROR'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN_ERROR';

export interface RepositoryError {
  code: RepositoryErrorCode;
  message: string;
  cause?: unknown;
}

export type RepositoryResult<T> =
  | { data: T; error: null }
  | { data: null; error: RepositoryError };

export const BACKEND_SETUP_REQUIRED_MESSAGE =
  'Backend setup required. Please apply Supabase SQL migrations.';

export function ok<T>(data: T): RepositoryResult<T> {
  return { data, error: null };
}

function errorText(error: unknown): string {
  if (typeof error === 'string') return error;
  if (typeof error !== 'object' || error === null) return '';

  const record = error as Record<string, unknown>;
  return [
    record.code,
    record.message,
    record.details,
    record.hint,
    record.name,
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');
}

export function isBackendSetupError(error: unknown) {
  const text = errorText(error).toLowerCase();

  return [
    'pgrst202',
    'pgrst205',
    'could not find the table',
    'could not find the function',
    'schema cache',
    'relation "public.',
    'bucket not found',
    'bucket does not exist',
    'nosuchbucket',
  ].some((pattern) => text.includes(pattern));
}

export function fail<T = never>(
  code: RepositoryErrorCode,
  message: string,
  cause?: unknown
): RepositoryResult<T> {
  const setupRequired = isBackendSetupError(cause) || isBackendSetupError(message);

  return {
    data: null,
    error: {
      code: setupRequired ? 'BACKEND_SETUP_REQUIRED' : code,
      message: setupRequired ? BACKEND_SETUP_REQUIRED_MESSAGE : message,
      cause,
    },
  };
}

function hasMessage(error: unknown): error is { message: string; code?: string } {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function normalizeRepositoryError(error: unknown): RepositoryError {
  if (hasMessage(error)) {
    const message = error.message;
    const lower = message.toLowerCase();

    if (isBackendSetupError(error)) {
      return { code: 'BACKEND_SETUP_REQUIRED', message: BACKEND_SETUP_REQUIRED_MESSAGE, cause: error };
    }

    if (lower.includes('permission') || lower.includes('row-level security') || lower.includes('rls')) {
      return { code: 'PERMISSION_DENIED', message, cause: error };
    }

    if (lower.includes('network') || lower.includes('fetch')) {
      return { code: 'NETWORK_ERROR', message, cause: error };
    }

    return { code: 'UNKNOWN_ERROR', message, cause: error };
  }

  return { code: 'UNKNOWN_ERROR', message: 'Unexpected repository error.', cause: error };
}

export async function guarded<T>(operation: () => Promise<RepositoryResult<T>>): Promise<RepositoryResult<T>> {
  try {
    return await operation();
  } catch (error) {
    const normalized = normalizeRepositoryError(error);
    return fail(normalized.code, normalized.message, normalized.cause);
  }
}
