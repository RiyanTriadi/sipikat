import Link from 'next/link';
import ArticleCard from '@/components/user/ArticleCard'; 
import { Smartphone, FileText, ArrowRight } from 'lucide-react';
import Image from 'next/image';

async function getLatestArticles() {
    try {
        const res = await fetch('http://localhost:5000/api/artikel', {
            cache: 'no-store' 
        });

        if (!res.ok) {
            console.error("Gagal mengambil data artikel dari server.");
            return [];
        }
        
        const articles = await res.json();
        return articles
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);

    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
}

export default async function HomePage() {
    const latestArticles = await getLatestArticles();

    return (
        <main className="bg-gray-50">
            {/* --- Hero Section --- */}
            <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-white overflow-hidden">
                <div 
                    className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
                <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
                        Kenali & Atasi Kecanduan Gadget
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 drop-shadow-md">
                        Temukan tingkat ketergantungan Anda pada gadget dan dapatkan solusi yang dipersonalisasi melalui sistem pakar kami.
                    </p>
                </div>
            </section>

            {/* --- Diagnosis Card Section --- */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gray-50 rounded-2xl shadow-lg max-w-5xl mx-auto p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-gray-200">
                        <div className="flex-shrink-0 text-indigo-600">
                            <Image src="/diagnose.svg" alt="Logo Kabupaten Pandeglang" width={158} height={48} unoptimized />
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Siap Mengambil Langkah Pertama?</h2>
                            <p className="mt-2 text-base md:text-lg text-gray-600">
                                Jawab beberapa pertanyaan singkat untuk mendapatkan analisis mendalam tentang tingkat kecanduan gadget Anda. Prosesnya cepat, mudah, dan sepenuhnya rahasia.
                            </p>
                        </div>
                        <div className="flex-shrink-0 mt-6 md:mt-0">
                             <Link href="/diagnosa" className="inline-flex items-center justify-center w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300">
                                Lakukan Tes
                            </Link>
                        </div>  
                    </div>
                </div>
            </section>
          
            {/* --- Latest Articles Section --- */}
            {latestArticles.length > 0 && (
                <section className="py-16 sm:py-24 bg-gray-100">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Informasi Terbaru</h2>
                            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Baca artikel pilihan untuk menambah pengetahuan Anda tentang kesehatan digital.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {latestArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link href="/artikel" className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group">
                                Lihat Semua Artikel
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* --- Supported By Section --- */}
            <section className="py-16 bg-white border-t border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-xl font-semibold text-gray-600 mb-10">
                        Didukung Oleh
                    </h2>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
                            <Image src="/unma logo.png" alt="Logo Universitas Mathla'ul Anwar" width={158} height={48} unoptimized />
                            <Image src="/pandeglang logo.png" alt="Logo Kabupaten Pandeglang" width={158} height={48} unoptimized />
                    </div>
                </div>
            </section>
        </main>
    );
}