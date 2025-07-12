// src/app/(user)/artikel/[slug]/page.jsx
import Link from 'next/link';
import ImageWithFallback from '../ImageWithFallback'; // Path relatif harus benar
import { ArrowLeft } from 'lucide-react';

// Fungsi getArticle (tanpa perubahan fungsionalitas)
async function getArticle(slug) {
    try {
        const res = await fetch(`http://localhost:5000/api/artikel/${slug}`, {
            cache: 'no-store'
        });
        if (!res.ok) {
            console.error(`Error fetching article for slug ${slug}: ${res.status} - ${res.statusText}`);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error('Error in getArticle:', error);
        return null;
    }
}

export default async function ArtikelDetailPage({ params }) {
    // Perbaikan ada di baris ini: tambahkan 'await' sebelum params.slug
    const currentParams = await params; // Ini adalah perubahan utama
    const article = await getArticle(currentParams.slug); // Gunakan currentParams

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Artikel Tidak Ditemukan</h1>
                    <p className="text-gray-600 mt-4 mb-8">Maaf, artikel yang Anda cari tidak ada atau telah dihapus.</p>
                    <Link href="/artikel" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Kembali ke Daftar Artikel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 w-full border border-gray-200">
                    <div className="mb-8">
                           <Link href="/artikel" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold group transition-colors">
                                Kembali ke semua artikel
                            </Link>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                        {article.judul}
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base mb-6 border-b pb-4 border-gray-200">
                        Dipublikasikan pada {new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <ImageWithFallback
                        src={`/${article.gambar}`}
                        alt={`Gambar untuk ${article.judul}`}
                        className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-md border border-gray-200"
                    />
 
                    <div
                        className="prose lg:prose-lg max-w-none text-gray-800 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ __html: article.konten }}
                    />
                </article>
            </div>
        </div>
    );
}