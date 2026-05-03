import { NextResponse } from 'next/server';
import { getFrontendOrigin } from '@/lib/securityHeaders';

const body = `User-agent: *\nDisallow: /admin/\nAllow: /\n\nSitemap: ${getFrontendOrigin()}/sitemap.xml\n`;

export function GET() {
    return new NextResponse(body, {
        status: 200,
        headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}

export function HEAD() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}

export const dynamic = 'force-static';
