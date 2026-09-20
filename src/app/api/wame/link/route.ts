import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function token(): Promise<string | null> {
  return (await cookies()).get('access_token')?.value ?? null;
}

export async function POST(): Promise<Response> {
  const t = await token();
  if (!t) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const res = await fetch(BASE_URL + '/wame/link', {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function DELETE(): Promise<Response> {
  const t = await token();
  if (!t) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const res = await fetch(BASE_URL + '/wame/link', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${t}` },
  });
  if (res.status === 204) return new Response(null, { status: 204 });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
