import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function pinHeader(req: Request): string | null {
  return req.headers.get('x-history-pin');
}

async function auth(pin: string | null): Promise<Record<string, string> | null> {
  const t = (await cookies()).get('access_token')?.value;
  if (!t) return null;
  const h: Record<string, string> = { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' };
  if (pin) h['X-History-Pin'] = pin;
  return h;
}

export async function GET(req: Request): Promise<Response> {
  const headers = await auth(pinHeader(req));
  if (!headers) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const res = await fetch(BASE_URL + '/history/entries', { headers, cache: 'no-store' });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function POST(req: Request): Promise<Response> {
  const headers = await auth(pinHeader(req));
  if (!headers) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const body = await req.json();
  const res = await fetch(BASE_URL + '/history/entries', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
