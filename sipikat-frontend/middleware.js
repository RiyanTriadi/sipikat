import { NextResponse } from 'next/server';
import { buildContentSecurityPolicy, securityHeaderEntries } from './src/lib/securityHeaders';

const NONCE_BYTES = 16;

const createNonce = () => {
    const bytes = new Uint8Array(NONCE_BYTES);
    crypto.getRandomValues(bytes);

    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
};

export function middleware(request) {
    const nonce = createNonce();
    const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set('content-security-policy', contentSecurityPolicy);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    for (const [header, value] of securityHeaderEntries(contentSecurityPolicy)) {
        response.headers.set(header, value);
    }

    if (request.nextUrl.protocol === 'https:') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    const pathname = request.nextUrl.pathname;

    if (
        pathname === '/admin' ||
        pathname === '/admin/' ||
        pathname.startsWith('/admin/') ||
        pathname === '/diagnosa/hasil'
    ) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
