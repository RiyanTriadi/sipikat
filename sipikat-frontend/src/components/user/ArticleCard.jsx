import Link from 'next/link';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ArticleCard({ article, priority = false }) {
    if (!article || !article.slug || !article.id) {
        return null;
    }

    // Build full URL untuk gambar
    const imageUrl = article.gambar 
        ? (article.gambar.startsWith('http') ? article.gambar : `${API_BASE_URL}${article.gambar}`)
        : null;

    return (
        <Link href={`/artikel/${article.slug}`} passHref>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer h-full flex flex-col border border-gray-100 group">
                <div className="relative w-full h-40 sm:h-52 overflow-hidden rounded-t-xl bg-gray-200">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={`Gambar untuk ${article.judul}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            priority={priority}
                            quality={75}
                            unoptimized={process.env.NODE_ENV === 'development'}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="p-4 sm:p-6 flex-grow flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition duration-200 leading-tight line-clamp-2">
                            {article.judul}
                        </h2>
                    </div>
                    <p className="text-gray-600 text-sm italic mt-3">
                        Dipublikasikan pada {new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
        </Link>
    );
}