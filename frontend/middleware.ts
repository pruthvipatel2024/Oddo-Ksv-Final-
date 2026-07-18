import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // Let public files, assets, api calls pass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('file.svg') ||
    pathname.includes('globe.svg') ||
    pathname.includes('next.svg') ||
    pathname.includes('vercel.svg') ||
    pathname.includes('window.svg')
  ) {
    return NextResponse.next();
  }

  // 1. Handle Guest paths (login, signup)
  const isAuthRoute = 
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/register') ||
    pathname.startsWith('/auth/organization-code') ||
    pathname.startsWith('/admin/login');

  let userRole: string | null = null;
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      userRole = decodedPayload.role;
    } catch (e) {
      // Invalid token
    }
  }

  if (isAuthRoute) {
    if (token && userRole) {
      if (userRole === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Handle Protected Employee paths
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (userRole !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 3. Handle Protected Admin paths
  if (pathname.startsWith('/admin/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (userRole !== 'ORGANIZATION_ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Default redirect for root "/"
  if (pathname === '/') {
    if (token && userRole) {
      if (userRole === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
