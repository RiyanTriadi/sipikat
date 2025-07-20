import Link from 'next/link';
import ImageWithFallback from '@/components/user/ImageWithFallback'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ArticleCard({ article }) {
    if (!article || !article.slug || !article.id) {
        return null;
    }

    const imageUrl = article.gambar 
        ? `${API_BASE_URL}${article.gambar}`
        : 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=Gambar';

    return (
        <Link href={`/artikel/${article.slug}`} passHref>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer h-full flex flex-col border border-gray-100 group">
                <div className="w-full h-52 overflow-hidden rounded-t-xl">
                    <ImageWithFallback
                        src={imageUrl}
                        alt={`Gambar untuk ${article.judul}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        width={600}
                        height={400}
                    />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition duration-200 leading-tight">
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
