import { getFrontendOrigin } from '@/lib/securityHeaders';

const routes = [
    '',
    '/artikel',
    '/diagnosa',
    '/tentang',
    '/syarat-ketentuan',
    '/kebijakan-privasi',
];

export default function sitemap() {
    const baseUrl = getFrontendOrigin();
    const lastModified = new Date();

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified,
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.7,
    }));
}
