const DEFAULT_FRONTEND_ORIGIN = 'https://edu-sipikat.com';
const DEFAULT_API_ORIGIN = 'https://api.edu-sipikat.com';

const getOrigin = (value, fallback) => {
    try {
        return new URL(value || fallback).origin;
    } catch {
        return fallback;
    }
};

export const getFrontendOrigin = () =>
    getOrigin(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_FRONTEND_ORIGIN);

export const getApiOrigin = () =>
    getOrigin(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_ORIGIN);

export const getImageSources = () => {
    const sources = new Set([
        "'self'",
        'data:',
        'blob:',
        'https://images.unsplash.com',
        'https://placehold.co',
        getApiOrigin(),
    ]);

    if (process.env.NODE_ENV !== 'production') {
        sources.add('http://localhost:5000');
    }

    return [...sources];
};

export const buildContentSecurityPolicy = (nonce) => {
    const scriptSources = ["'self'"];
    const styleSources = ["'self'"];
    const connectSources = ["'self'", getApiOrigin()];
    const imgSources = getImageSources();

    if (nonce) {
        const nonceValue = `'nonce-${nonce}'`;
        scriptSources.push(nonceValue);
        styleSources.push(nonceValue);
    }

    if (process.env.NODE_ENV !== 'production') {
        scriptSources.push("'unsafe-eval'");
        connectSources.push('ws:', 'wss:');
    }

    return [
        "default-src 'self'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        `connect-src ${connectSources.join(' ')}`,
        `img-src ${imgSources.join(' ')}`,
        "font-src 'self' data:",
        "manifest-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        `script-src ${scriptSources.join(' ')}`,
        "script-src-attr 'none'",
        `style-src ${styleSources.join(' ')}`,
        "style-src-attr 'unsafe-inline'",
        "worker-src 'self' blob:",
        'upgrade-insecure-requests',
    ].join('; ');
};

export const securityHeaderEntries = (contentSecurityPolicy) => [
    ['Content-Security-Policy', contentSecurityPolicy],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['X-Content-Type-Options', 'nosniff'],
    ['X-Frame-Options', 'DENY'],
];
