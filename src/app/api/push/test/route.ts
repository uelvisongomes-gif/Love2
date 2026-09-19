import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function POST(): Promise<Response> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } },
      { status: 401 },
    );
  }
  const res = await fetch(BASE_URL + '/push/test', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
