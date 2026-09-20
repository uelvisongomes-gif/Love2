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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const headers = await auth(pinHeader(req));
  if (!headers) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${BASE_URL}/history/entries/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const headers = await auth(pinHeader(req));
  if (!headers) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await params;
  const res = await fetch(`${BASE_URL}/history/entries/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (res.status === 204) return new Response(null, { status: 204 });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
