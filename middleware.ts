import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractTenantSlug } from './lib/tenant/resolver';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static files, Next.js internal chunks, icons, and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get('host');
  const customSlugHeader = request.headers.get('x-tenant-slug');
  const cookieSlug = request.cookies.get('tenant_slug')?.value;

  const tenantSlug = customSlugHeader || cookieSlug || extractTenantSlug(host);

  // Clone headers and inject tenant information
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Expose tenant header on response for debugging
  response.headers.set('x-tenant-slug', tenantSlug);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all routes except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
