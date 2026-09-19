import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function POST(req: Request): Promise<Response> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } },
      { status: 401 },
    );
  }
  const body = await req.json();
  const res = await fetch(BASE_URL + '/push/unsubscribe', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 204) return new Response(null, { status: 204 });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
