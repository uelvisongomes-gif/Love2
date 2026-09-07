/**
 * Browser-side fetch wrapper. Talks to our OWN /api/* Route Handlers so
 * httpOnly cookies flow correctly. Server-side reads live in ./api-server.ts
 * (imports next/headers, cannot be bundled for the client).
 */

export interface ApiError extends Error {
  status: number;
  code?: string;
}

function toApiError(status: number, body: unknown, fallback: string): ApiError {
  const b = body as { error?: { code?: string; message?: string } } | undefined;
  const message = b?.error?.message ?? fallback;
  const err = new Error(message) as ApiError;
  err.status = status;
  err.code = b?.error?.code;
  return err;
}

export async function apiClient<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(path, { ...init, headers, credentials: 'include' });
  const contentType = res.headers.get('content-type') ?? '';
  const body: unknown = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw toApiError(res.status, body, 'Erro na requisição');
  return body as T;
}
