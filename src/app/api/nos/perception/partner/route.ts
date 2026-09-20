import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function GET(): Promise<Response> {
  const t = (await cookies()).get('access_token')?.value;
  if (!t) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const res = await fetch(BASE_URL + '/nos/perception/partner', {
    headers: { Authorization: `Bearer ${t}` },
    cache: 'no-store',
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
