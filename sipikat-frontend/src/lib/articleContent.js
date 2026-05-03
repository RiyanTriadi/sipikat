import { Text } from 'slate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getValidImageUrl = (path) => {
    if (!path) {
        return null;
    }

    if (path.startsWith('http')) {
        return path;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
    return `${cleanBaseUrl}${cleanPath}`;
};

export const serializeSlateToHtml = (nodes) => {
    if (!nodes || !Array.isArray(nodes)) {
        return '';
    }

    const escapeHtml = (str) => {
        if (typeof str !== 'string') {
            return '';
        }

        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    return nodes
        .map((node) => {
            if (Text.isText(node)) {
                let text = escapeHtml(node.text);
                if (node.bold) text = `<strong>${text}</strong>`;
                if (node.italic) text = `<em>${text}</em>`;
                if (node.underline) text = `<u>${text}</u>`;
                return text;
            }

            const children = serializeSlateToHtml(node.children);

            switch (node.type) {
                case 'heading-one':
                    return `<h1 class="text-3xl font-bold my-4">${children}</h1>`;
                case 'heading-two':
                    return `<h2 class="text-2xl font-bold my-3">${children}</h2>`;
                case 'block-quote':
                    return `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${children}</blockquote>`;
                case 'numbered-list':
                    return `<ol class="list-decimal list-inside my-4 space-y-2">${children}</ol>`;
                case 'bulleted-list':
                    return `<ul class="list-disc list-inside my-4 space-y-2">${children}</ul>`;
                case 'list-item':
                    return `<li>${children}</li>`;
                case 'image':
                    if (!node.url) {
                        return '';
                    }

                    return `
                        <div class="my-8">
                            <img
                                src="${getValidImageUrl(node.url)}"
                                alt="${escapeHtml(node.alt || '')}"
                                class="w-full h-auto max-h-[500px] rounded-lg border border-gray-200 object-cover shadow-md"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    `;
                default:
                    return `<p class="my-4">${children}</p>`;
            }
        })
        .join('');
};

export const parseAndRenderContent = (contentString) => {
    const escapeHtml = (str) => {
        if (typeof str !== 'string') {
            return '';
        }

        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    try {
        const parsedContent = JSON.parse(contentString);
        return serializeSlateToHtml(parsedContent);
    } catch (error) {
        console.error('Error parsing content as JSON, rendering as escaped text:', error);
        return `<p class="my-4">${escapeHtml(contentString || '')}</p>`;
    }
};
