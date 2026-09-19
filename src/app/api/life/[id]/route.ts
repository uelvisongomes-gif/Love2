import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function auth(): Promise<HeadersInit | null> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const headers = await auth();
  if (!headers) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${BASE_URL}/life/${id}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await params;
  const res = await fetch(`${BASE_URL}/life/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return new Response(null, { status: 204 });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
