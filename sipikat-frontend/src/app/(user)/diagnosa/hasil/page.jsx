// src/app/(user)/diagnosa/hasil/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function HasilPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedResult = localStorage.getItem('diagnosisResult');
        if (storedResult) {
            setResult(JSON.parse(storedResult));
        }
        setLoading(false);
    }, []);

    const getCategoryStyles = (kategori) => {
        if (kategori.toLowerCase().includes('kecanduan')) return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', progress: 'bg-red-500' };
        if (kategori.toLowerCase().includes('waspada')) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', progress: 'bg-yellow-500' };
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', progress: 'bg-green-500' };
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-lg text-gray-600">Memuat hasil...</div>;
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center bg-white p-10 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Hasil Tidak Ditemukan</h1>
                    <p className="mb-8 text-gray-600">Sepertinya Anda belum melakukan diagnosa.</p>
                    <Link href="/diagnosa" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Kembali ke Halaman Diagnosa
                    </Link>
                </div>
            </div>
        );
    }
    
    const percentage = (result.total_cf * 100).toFixed(2);
    const styles = getCategoryStyles(result.kategori);

    return (
        <div className="min-h-screen bg-gray-50 py-12 sm:py-16 px-4">
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200">
                <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">Hasil Diagnosa Anda</h1>
                
                <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-700">Tingkat Keyakinan Sistem</h2>
                    <p className={`text-5xl font-bold ${styles.text} my-2`}>{percentage}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                            className={`${styles.progress} h-4 rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className={`${styles.bg} border-l-4 ${styles.border} p-5 rounded-r-lg`}>
                        <h3 className="text-lg font-semibold ${styles.text}">Kategori Kecanduan</h3>
                        <p className={`text-xl font-bold ${styles.text} mt-1`}>{result.kategori}</p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Solusi & Rekomendasi</h3>
                        <p className="text-gray-600 mt-2 leading-relaxed">
                            {result.solusi}
                        </p>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <Link href="/diagnosa" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold group transition-colors">
                        <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-[-90deg]" />
                        Lakukan Diagnosa Ulang
                    </Link>
                </div>
            </div>
        </div>
    );
}