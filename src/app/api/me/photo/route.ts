import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function token(): Promise<string | null> {
  return (await cookies()).get('access_token')?.value ?? null;
}

export async function PUT(req: Request): Promise<Response> {
  const t = await token();
  if (!t) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const body = await req.json();
  const res = await fetch(BASE_URL + '/me/photo', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function DELETE(): Promise<Response> {
  const t = await token();
  if (!t) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const res = await fetch(BASE_URL + '/me/photo', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${t}` },
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
