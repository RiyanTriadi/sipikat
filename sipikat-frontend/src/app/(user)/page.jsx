import Link from 'next/link';
import ArticleCard from '@/components/user/ArticleCard';
import Image from 'next/image';

async function getLatestArticles() {
    try {
        const res = await fetch(`http://localhost:5000/api/artikel`);

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
    <main className="bg-gray-50 font-sans antialiased">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-white overflow-hidden">
        <div
          className="absolute top-0 lef t-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            Kenali & Atasi Kecanduan Gadget
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 drop-shadow-md">
            Cari tahu seberapa sering Anda memakai gadget dan dapatkan saran khusus dari kami untuk mengaturnya.
          </p>
          <Link href="/diagnosa" className="mt-8 inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform">
            Lakukan Tes Sekarang
          </Link>
        </div>
      </section>

      {/* Download Section - Card Style */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Unduh Aplikasi SIPIKAT
            </h2>
            <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
              Dapatkan versi terbaru aplikasi kami untuk perangkat Android.
            </p>
          </div>
          <div className="max-w-2xl mx-auto bg-blue-100 border border-gray-200 rounded-2xl p-6 md:p-10 shadow-xl flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex-shrink-0">
              {/* Ikon besar aplikasi */}
              <div className="w-24 h-24 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
                <Image
                  className="rounded-2xl"
                  src="/sipikat-logo.png"
                  width={500}
                  height={500}
                  alt="Picture of the author"
                />
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900">SIPIKAT v1.0.0</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aplikasi ini hanya tersedia untuk perangkat Android.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a
                href="/downloads/sipikat v1.0.0.apk"
                download
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform group"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Unduh Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
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
              <Link href="/artikel" className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-800 transition-colors group">
                Lihat Semua Artikel
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Partner Logos Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold text-gray-600 mb-10">
            Didukung Oleh
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            <div className="w-20 sm:w-32 md:w-[158px]">
              <Image src="/unma logo.png" alt="Logo Universitas Mathla'ul Anwar" layout="responsive" width={158} height={48} unoptimized />
            </div>
            <div className="w-20 sm:w-32 md:w-[158px]">
              <Image src="/pandeglang logo.png" alt="Logo Kabupaten Pandeglang" layout="responsive" width={158} height={48} unoptimized />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
