import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function token(): Promise<string | null> {
  return (await cookies()).get('access_token')?.value ?? null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const t = await token();
  if (!t) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${BASE_URL}/nos/challenges/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const t = await token();
  if (!t) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await params;
  const res = await fetch(`${BASE_URL}/nos/challenges/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${t}` },
  });
  if (res.status === 204) return new Response(null, { status: 204 });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
