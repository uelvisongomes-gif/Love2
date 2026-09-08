import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const res = await fetch(BASE_URL + '/love/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: { message: 'Erro' } }));
    return Response.json(json, { status: res.status });
  }
  const buffer = await res.arrayBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
