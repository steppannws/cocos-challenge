import type { z } from 'zod';
import { env } from '@/config/env';
import { useSessionStore } from '@/store/session';

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'shape';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status = 0,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isRetryable = (error: unknown): boolean =>
  error instanceof ApiError &&
  (error.kind === 'network' || error.kind === 'timeout' || error.status >= 500);

type RequestOptions<T> = {
  method?: 'GET' | 'POST';
  body?: unknown;
  schema: z.ZodType<T>;
  signal?: AbortSignal;
};

const TIMEOUT_MS = 15_000;

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

// The API answers `{ error: "..." }` on 4xx; keep that text, it is what the user needs to see.
const errorMessage = (body: unknown, fallback: string): string =>
  typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
    ? body.error
    : fallback;

// Headers the challenge API requires on every call (see PRODUCT_BRIEF.md, Backend).
const headers = (): Record<string, string> => {
  const { candidateId, bugLevel } = useSessionStore.getState();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Candidate-Id': candidateId,
    'X-Enable-Bugs': __DEV__ ? bugLevel : 'off',
  };
};

/** The only HTTP entry point. Every response is validated with the caller's zod schema. */
export async function request<T>(
  path: string,
  { method = 'GET', body, schema, signal }: RequestOptions<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onOuterAbort = () => controller.abort();
  signal?.addEventListener('abort', onOuterAbort);

  let response: Response;
  try {
    response = await fetch(`${env.API_URL}${path}`, {
      method,
      headers: headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = controller.signal.aborted && !signal?.aborted;
    throw new ApiError(timedOut ? 'timeout' : 'network', String(error));
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onOuterAbort);
  }

  const text = await response.text();
  const json = text.length > 0 ? parseJson(text) : undefined;

  if (!response.ok) {
    throw new ApiError(
      'http',
      errorMessage(json, `HTTP ${response.status}`),
      response.status,
      json,
    );
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError('shape', parsed.error.message, response.status, json);
  }
  return parsed.data;
}
