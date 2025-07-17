import ArticleCard from '@/components/user/ArticleCard';

async function getArticles() {
    try {
        const res = await fetch('http://localhost:5000/api/artikel', {
            cache: 'no-store' 
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); 
            throw new Error(errorData.message || 'Gagal mengambil data artikel dari server.');
        }
        return res.json(); 
    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
}

export default async function ArtikelPage() {
    const articles = await getArticles();

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Informasi & Edukasi
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
                        Jelajahi informasi terkini seputar dampak dan cara mengatasi kecanduan gadget.
                    </p>
                </div>

                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full mx-auto">
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-16 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
                        <h2 className="text-2xl font-semibold text-gray-800">Belum Ada Artikel</h2>
                        <p className="mt-2">Saat ini belum ada artikel yang tersedia. Silakan coba lagi nanti.</p>
                    </div>
                )}
            </div>
        </div>
    );
}