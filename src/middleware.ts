import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/home',
  '/chat',
  '/conflitos',
  '/checkin',
  '/journal',
  '/tarefas',
  '/parceiro',
  '/perfil',
  '/onboarding',
];
const AUTH_PAGES = ['/entrar', '/registrar'];

export function middleware(req: NextRequest): NextResponse | undefined {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('access_token')?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/entrar';
    return NextResponse.redirect(url);
  }
  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
