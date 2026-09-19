import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await params;
  const res = await fetch(`${BASE_URL}/life/${id}/toggle-done`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
