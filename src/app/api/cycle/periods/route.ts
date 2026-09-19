import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function auth(): Promise<HeadersInit | null> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function GET(): Promise<Response> {
  const headers = await auth();
  if (!headers) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const res = await fetch(BASE_URL + '/cycle/periods', { headers, cache: 'no-store' });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function POST(req: Request): Promise<Response> {
  const headers = await auth();
  if (!headers) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const body = await req.json();
  const res = await fetch(BASE_URL + '/cycle/periods', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
