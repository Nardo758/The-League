import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const redirects: Record<string, string> = {
    '/channels': '/',
    '/discover': '/',
    '/venues': '/search?tab=venues',
    '/leagues': '/search?tab=leagues',
    '/tournaments': '/search?tab=tournaments',
    '/news': '/',
    '/announcements': '/',
  };

  if (redirects[pathname]) {
    const url = request.nextUrl.clone();
    const target = redirects[pathname];
    if (target.includes('?')) {
      const [path, query] = target.split('?');
      url.pathname = path;
      url.search = `?${query}`;
    } else {
      url.pathname = target;
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/channels', '/discover', '/venues', '/leagues', '/tournaments', '/news', '/announcements'],
};
