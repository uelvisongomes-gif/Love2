import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function GET(): Promise<Response> {
  const res = await fetch(BASE_URL + '/push/public-key', { cache: 'no-store' });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
