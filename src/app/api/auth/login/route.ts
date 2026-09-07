import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const COOKIE_NAME = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const res = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return NextResponse.json(json, { status: res.status });

  const response = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set(COOKIE_NAME, json.accessToken as string, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 15 * 60,
  });
  response.cookies.set(REFRESH_COOKIE, json.refreshToken as string, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
