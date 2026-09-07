import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function PUT(req: Request): Promise<Response> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
  }
  const body = await req.json();
  const res = await fetch(BASE_URL + '/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function GET(): Promise<Response> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
  }
  const res = await fetch(BASE_URL + '/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
