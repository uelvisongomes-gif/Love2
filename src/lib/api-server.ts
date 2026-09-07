/**
 * Server-side fetch wrapper. Reads the httpOnly access_token cookie via
 * next/headers and adds it as a Bearer token to backend requests.
 * Use only from Server Components / Route Handlers / server actions.
 */
import { cookies } from 'next/headers';
import type { ApiError } from './api-client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const COOKIE_NAME = 'access_token';

function toApiError(status: number, body: unknown, fallback: string): ApiError {
  const b = body as { error?: { code?: string; message?: string } } | undefined;
  const message = b?.error?.message ?? fallback;
  const err = new Error(message) as ApiError;
  err.status = status;
  err.code = b?.error?.code;
  return err;
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(BASE_URL + path, { ...init, headers, cache: 'no-store' });
  const contentType = res.headers.get('content-type') ?? '';
  const body: unknown = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw toApiError(res.status, body, 'Erro ao chamar a API');
  return body as T;
}
