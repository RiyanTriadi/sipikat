import Link from "next/link";
import ArticleCard from "@/components/user/ArticleCard";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getLatestArticles() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/artikel`, {
      next: {
        revalidate: 300, // Cache selama 5 menit untuk homepage
        tags: ["latest-articles"],
      },
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

const partnerLogos = [
  {
    src: "/diktisaintek-logo.webp",
    alt: "Logo Diktisaintek",
    width: 158,
    height: 48,
  },
  {
    src: "/unma logo.webp",
    alt: "Logo Universitas Mathla'ul Anwar",
    width: 158,
    height: 48,
  },
  {
    src: "/pandeglang logo.webp",
    alt: "Logo Kabupaten Pandeglang",
    width: 158,
    height: 48,
  },
  { src: "/pmm-logo.webp", alt: "Logo PMM Tegalwangi", width: 158, height: 48 },
  {
    src: "/kkn-logo.webp",
    alt: "Logo KKN 4 Tegalwangi UNMA",
    width: 158,
    height: 48,
  },
];

export default async function HomePage() {
  const latestArticles = await getLatestArticles();

  return (
    <main className="bg-gray-50 font-sans antialiased">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <Image
            src="/hero-bg.webp"
            alt="Hero background"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
            unoptimized={process.env.NODE_ENV === "development"}
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            Kenali & Atasi Kecanduan Gadget
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 drop-shadow-md">
            Cari tahu seberapa sering Anda memakai gadget dan dapatkan saran
            khusus dari kami untuk mengaturnya.
          </p>
          <Link
            href="/diagnosa"
            className="mt-8 inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700  transition-all duration-300 transform hover:scale-105"
          >
            Lakukan Tes Sekarang
          </Link>
        </div>
      </section>

      {/* App Download Section */}
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
              <div className="w-24 h-24 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg overflow-hidden relative">
                <Image
                  src="/sipikat-logo.webp"
                  width={96}
                  height={96}
                  alt="Logo aplikasi SIPIKAT"
                  className="rounded-2xl"
                  quality={90}
                />
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900">
                SIPIKAT Mobile
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Aplikasi SIPIKAT juga tersedia untuk perangkat Android.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a
                href="https://play.google.com/store/apps/details?id=com.tegalwangi.sipikat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform group"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Unduh di Play Store
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Informasi Terbaru
              </h2>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                Baca artikel pilihan untuk menambah pengetahuan Anda tentang
                kesehatan digital.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {latestArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  priority={index === 0}
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/artikel"
                className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-800 transition-colors group"
              >
                Lihat Semua Artikel
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Partners Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold text-gray-600 mb-10">
            Didukung Oleh
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {partnerLogos.map((logo, index) => (
              <div key={index} className="w-20 sm:w-32 md:w-[158px]">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={158}
                  height={48}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
