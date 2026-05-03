import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import SanitizedHtml from '@/components/common/SanitizedHtml';
import { getValidImageUrl, parseAndRenderContent } from '@/lib/articleContent';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getArticle(slug) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/artikel/${slug}`, {
            next: { 
                revalidate: 3600,
                tags: ['article', `article-${slug}`]
            }
        });
        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data && typeof data === 'object' ? data : null;
    } catch (error) {
        console.error('Error in getArticle:', error);
        return null;
    }
}

const formatArticleDate = (value) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

function OptimizedArticleImage({ src, alt, priority = false }) {
    const imageUrl = getValidImageUrl(src);
    
    // Jika URL null/kosong, jangan render apa-apa atau render placeholder (opsional)
    if (!imageUrl) return null;

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

    if (!slug || typeof slug !== 'string') {
        notFound();
    }

    const article = await getArticle(slug);

    if (!article || typeof article.judul !== 'string') {
        notFound();
    }

    const renderedContent = parseAndRenderContent(article.konten);
    const publishedDate = formatArticleDate(article.created_at);

    return (
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 w-full border border-gray-200">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                        {article.judul}
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base mb-6 border-b pb-4 border-gray-200">
                        Dipublikasikan pada {publishedDate || 'Tanggal tidak tersedia'}
                    </p>

                    {article.gambar && (
                        <OptimizedArticleImage
                            src={article.gambar}
                            alt={`Gambar untuk ${article.judul}`}
                            priority={true}
                        />
                    )}

                    <SanitizedHtml
                        as="div"
                        className="prose lg:prose-lg max-w-none text-gray-800 leading-relaxed"
                        html={renderedContent}
                    />
                    
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <Link href="/artikel" className="flex justify-end items-center text-blue-600 hover:text-blue-800 font-semibold group transition-colors">
                            Kembali ke semua artikel 
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
}

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
