import { ShieldCheck } from 'lucide-react';

async function getPageContent(slug) {
    try {
        const res = await fetch(`http://localhost:5000/api/pages/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch page content:", error);
        return null;
    }
}

export default async function PrivacyPolicyPage() {
    const page = await getPageContent('kebijakan-privasi');

    if (!page) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Halaman Tidak Ditemukan</h1>
                <p className="text-gray-600 mt-2">Konten tidak dapat dimuat saat ini.</p>
            </div>
        );
    }

    return (
        <div className="bg-white font-sans">
            <header className="bg-gray-800 text-white text-center py-20">
                <div className="container mx-auto px-6">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        {page.title}
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
                        Komitmen kami untuk melindungi data dan privasi Anda di SIPAKAT.
                    </p>
                </div>
            </header>

            <main className="py-16 md:py-24">
                <div 
                    className="container mx-auto px-6 prose prose-indigo lg:prose-lg max-w-4xl"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </main>
        </div>
    );
}
