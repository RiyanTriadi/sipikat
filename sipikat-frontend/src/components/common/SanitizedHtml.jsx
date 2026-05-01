'use client';

import { useEffect, useState } from 'react';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

export default function SanitizedHtml({ as: Tag = 'div', className, html = '' }) {
    const [safeHtml, setSafeHtml] = useState('');

    useEffect(() => {
        setSafeHtml(sanitizeHtml(html));
    }, [html]);

    return <Tag className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
