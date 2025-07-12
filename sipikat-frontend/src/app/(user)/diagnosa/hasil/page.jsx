'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, List, Lightbulb, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const RadialProgress = ({ percentage, styles }) => {
    const radius = 80;
    const stroke = 15;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                    stroke="#e5e7eb" 
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <motion.circle
                    stroke={styles.progress.replace('bg-', '')} 
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${styles.text}`}>
                    {percentage}%
                </span>
                <span className="text-sm text-gray-500">Keyakinan</span>
            </div>
        </div>
    );
};

const InfoCard = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-gray-800 ml-3">{title}</h3>
        </div>
        <div className="text-gray-600 space-y-2">
            {children}
        </div>
    </div>
);


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
        const lowerKategori = kategori.toLowerCase();
        if (lowerKategori.includes('kecanduan') || lowerKategori.includes('tinggi')) {
            return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-400', progress: 'bg-red-500' };
        }
        if (lowerKategori.includes('waspada') || lowerKategori.includes('sedang')) {
            return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-400', progress: 'bg-yellow-500' };
        }
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-400', progress: 'bg-green-600' };
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-lg text-gray-600">Memuat hasil...</div>;
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center bg-white p-10 rounded-lg shadow-xl">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Hasil Tidak Ditemukan</h1>
                    <p className="mb-8 text-gray-600">Sepertinya Anda belum melakukan diagnosa atau sesi telah berakhir.</p>
                    <Link href="/diagnosa" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105">
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-4">Hasil Diagnosa Anda</h1>
                    <p className="text-center text-gray-500 mb-10">Berikut adalah hasil analisis sistem berdasarkan gejala yang Anda berikan.</p>
                    
                    <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
                        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gray-50 border">
                            <RadialProgress percentage={percentage} styles={styles} />
                            <div className={`mt-6 text-center ${styles.bg} ${styles.text} px-4 py-2 rounded-full font-semibold`}>
                                Kategori: {result.kategori}
                            </div>
                        </div>

                        <InfoCard icon={<Lightbulb className={`h-6 w-6 ${styles.text}`} />} title="Solusi & Rekomendasi">
                            <p className="leading-relaxed">{result.solusi}</p>
                        </InfoCard>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <InfoCard icon={<User className="h-6 w-6 text-indigo-600" />} title="Detail Pasien">
                            <p><strong>Nama:</strong> {result.user.nama}</p>
                            <p><strong>Usia:</strong> {result.user.usia} tahun</p>
                            <p><strong>Jenis Kelamin:</strong> {result.user.jenis_kelamin}</p>
                            <p><strong>Alamat:</strong> {result.user.alamat}</p>
                        </InfoCard>

                        <InfoCard icon={<List className="h-6 w-6 text-indigo-600" />} title="Gejala yang Dialami">
                            <ul className="list-disc list-inside space-y-1">
                                {result.gejala_terpilih.map(g => (
                                    <li key={g.id}>
                                        {g.gejala} <span className="text-gray-500">- ({(g.cf_user * 100).toFixed(0)}%)</span>
                                    </li>
                                ))}
                            </ul>
                        </InfoCard>
                    </div>

                    <div className="text-center mt-12 pt-8 border-t border-gray-200">
                        <Link href="/diagnosa" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105">
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Lakukan Diagnosa Ulang
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}