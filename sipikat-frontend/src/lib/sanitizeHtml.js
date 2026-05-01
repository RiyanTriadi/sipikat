'use client';

import DOMPurify from 'dompurify';

export const sanitizeHtml = (html) => {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });
};
