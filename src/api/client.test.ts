import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

vi.mock('@/config/env', () => ({
  env: { API_URL: 'https://api.test', CANDIDATE_ID: 'x', SENTRY_DSN: '' },
}));
vi.mock('@/store/session', () => ({
  useSessionStore: { getState: () => ({ candidateId: 'alice', bugLevel: 'hard' }) },
}));

const { ApiError, isRetryable, request } = await import('./client');

const fetchMock = vi.fn<typeof fetch>();
const respond = (status: number, body: unknown) =>
  fetchMock.mockResolvedValueOnce(
    new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }),
  );
const schema = z.object({ ok: z.boolean() });

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('request', () => {
  it('sends the challenge headers and parses the response', async () => {
    respond(200, { ok: true });
    await expect(request('/ping', { schema })).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://api.test/ping');
    expect(init?.headers).toMatchObject({ 'X-Candidate-Id': 'alice', 'X-Enable-Bugs': 'hard' });
    expect(init?.method).toBe('GET');
  });

  it('serializes a POST body', async () => {
    respond(201, { ok: true });
    await request('/orders', { method: 'POST', body: { quantity: 1 }, schema });
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe('{"quantity":1}');
  });

  it("surfaces the API's own error text on 4xx and does not retry it", async () => {
    respond(400, { error: 'Insufficient cash' });
    const error = await request('/orders', { schema }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'http', status: 400, message: 'Insufficient cash' });
    expect(isRetryable(error)).toBe(false);
  });

  it('falls back to the status when the error body is not JSON', async () => {
    respond(502, '<html>Bad gateway</html>');
    const error = await request('/instruments', { schema }).catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'http', status: 502, message: 'HTTP 502' });
    expect(isRetryable(error)).toBe(true);
  });

  it('rejects a 200 whose shape does not match the schema', async () => {
    respond(200, { ok: 'yes' });
    const error = await request('/ping', { schema }).catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'shape', status: 200 });
    expect(isRetryable(error)).toBe(false);
  });

  it('maps a failed fetch to a retryable network error', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    const error = await request('/ping', { schema }).catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'network' });
    expect(isRetryable(error)).toBe(true);
  });

  it('aborts after the timeout and reports it as such', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementationOnce(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const pending = request('/slow', { schema });
    const settled = pending.catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await settled).toMatchObject({ kind: 'timeout' });
  });

  it('propagates an outer abort as a network error, not a timeout', async () => {
    const controller = new AbortController();
    fetchMock.mockImplementationOnce(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const settled = request('/slow', { schema, signal: controller.signal }).catch(
      (e: unknown) => e,
    );
    controller.abort();
    expect(await settled).toMatchObject({ kind: 'network' });
  });
});
