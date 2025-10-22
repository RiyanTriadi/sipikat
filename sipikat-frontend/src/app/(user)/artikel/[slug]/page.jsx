import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Text } from 'slate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getArticle(slug) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/artikel/${slug}`, {
            next: { 
                revalidate: 3600, // Cache selama 1 jam
                tags: ['article', `article-${slug}`]
            }
        });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (error) {
        console.error('Error in getArticle:', error);
        return null;
    }
}

export const serializeSlateToHtml = (nodes) => {
    if (!nodes || !Array.isArray(nodes)) return '';

    const escapeHtml = str => {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    return nodes.map(node => {
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
                if (node.url) {
                    const imageUrl = `${API_BASE_URL}${node.url}`;
                    // Optimasi: gunakan loading lazy dan srcset
                    return `
                        <div class="my-8">
                            <img 
                                src="${imageUrl}" 
                                alt="${escapeHtml(node.alt || '')}" 
                                class="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md border border-gray-200" 
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    `;
                }
                return '';
            default: 
                return `<p class="my-4">${children}</p>`;
        }
    }).join('');
};

export const parseAndRenderContent = (contentString) => {
    try {
        const parsedContent = JSON.parse(contentString);
        return serializeSlateToHtml(parsedContent);
    } catch (e) {
        console.error("Error parsing content as JSON, rendering as plain HTML:", e);
        return contentString;
    }
};

// Komponen Optimized Image untuk artikel
function OptimizedArticleImage({ src, alt, priority = false }) {
    // Build full URL untuk image
    const imageUrl = src.startsWith('http') ? src : `${API_BASE_URL}${src}`;
    
    return (
        <div className="relative w-full mb-8 rounded-lg overflow-hidden shadow-md border border-gray-200">
            <Image
                src={imageUrl}
                alt={alt}
                width={1200}
                height={600}
                priority={priority}
                quality={80}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="w-full h-auto max-h-[500px] object-cover"
                unoptimized={process.env.NODE_ENV === 'development'}
            />
        </div>
    );
}

export default async function ArtikelDetailPage({ params }) {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Artikel Tidak Ditemukan</h1>
                    <p className="text-gray-600 mt-4 mb-8">Maaf, artikel yang Anda cari tidak ada atau telah dihapus.</p>
                    <Link href="/artikel" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
                        Daftar Artikel
                    </Link>
                </div>
            </div>
        );
    }

    const renderedContent = parseAndRenderContent(article.konten);

    return (
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 w-full border border-gray-200">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                        {article.judul}
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base mb-6 border-b pb-4 border-gray-200">
                        Dipublikasikan pada {new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    {article.gambar && (
                        <OptimizedArticleImage
                            src={article.gambar}
                            alt={`Gambar untuk ${article.judul}`}
                            priority={true}
                        />
                    )}

                    <div
                        className="prose lg:prose-lg max-w-none text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                    <div className="mt-8">
                        <Link href="/artikel" className="flex justify-end items-center text-blue-600 hover:text-blue-800 font-semibold group transition-colors">
                            Kembali ke semua artikel
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
}

// Generate static params untuk pre-rendering (opsional)
export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/artikel`, {
            next: { revalidate: 3600 }
        });
        
        if (!res.ok) return [];
        
        const articles = await res.json();
        
        return articles.map((article) => ({
            slug: article.slug,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Metadata untuk SEO
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const article = await getArticle(slug);
    
    if (!article) {
        return {
            title: 'Artikel Tidak Ditemukan',
        };
    }
    
    return {
        title: article.judul,
        description: article.judul,
        openGraph: {
            title: article.judul,
            description: article.judul,
            images: article.gambar ? [`${API_BASE_URL}${article.gambar}`] : [],
        },
    };
}