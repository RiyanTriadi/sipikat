import { NextResponse } from 'next/server';

const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Content-Type': 'text/plain; charset=utf-8',
};

export function GET() {
    return new NextResponse('Not Found', {
        status: 404,
        headers,
    });
}

export function HEAD() {
    return new NextResponse(null, {
        status: 404,
        headers,
    });
}

export const dynamic = 'force-static';
