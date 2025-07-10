'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LayoutDashboard, FileText, Stethoscope, Users, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const Alert = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-sm mb-6" role="alert">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="font-medium">{message}</span>
    </div>
);

const Spinner = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
        <p className="mt-4 text-lg">{text}</p>
    </div>
);

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalGejala: null,
        totalArtikel: null,
        totalDiagnosa: null,
        totalUsers: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter(); 

    useEffect(() => {
        const fetchDashboardStats = async () => {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('adminToken'); 

            if (!token) {
                setError('Anda tidak terautentikasi. Silakan login kembali.');
                setLoading(false);
                router.push('/admin/login'); 
                return;
            }

            try {
                const fetchPromises = [
                    fetch(`${API_BASE_URL}/gejala`, { headers: { 'Authorization': `Bearer ${token}` } }), 
                    fetch(`${API_BASE_URL}/artikel`, { headers: { 'Authorization': `Bearer ${token}` } }), 
                    fetch(`${API_BASE_URL}/diagnosa`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }), 
                ];

                const responses = await Promise.all(fetchPromises);

                // Process each response
                const results = await Promise.all(responses.map(async (res, index) => {
                    if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem('adminToken');
                        throw new Error('Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.');
                    }
                    if (!res.ok) {
                        let msg = `Gagal memuat data ${['gejala', 'artikel', 'diagnosa', 'pengguna'][index]}.`;
                        try {
                            const errData = await res.json();
                            msg = errData.message || msg;
                        } catch (jsonErr) {
                            msg = res.statusText || msg;
                        }
                        throw new Error(msg);
                    }
                    return res.json();
                }));

                setStats({
                    totalGejala: results[0].length,
                    totalArtikel: results[1].length,
                    totalDiagnosa: results[2].length,
                    totalUsers: results[3].length,
                });

            } catch (err) {
                setError(err.message);
                console.error("Error fetching dashboard stats:", err);
                if (err.message.includes('Sesi Anda telah berakhir') || err.message.includes('tidak terautentikasi')) {
                    router.push('/admin/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [router]); 

    return (
        <div className="min-h-screen bg-gray-50 font-inter antialiased p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <LayoutDashboard className="h-8 w-8 text-indigo-600" /> Dashboard Admin
                        </h1>
                        <p className="mt-1 text-gray-600 text-lg">Selamat datang di panel administrasi SIPAKAT. Berikut adalah ringkasan data Anda.</p>
                    </div>
                </div>

                {error && <Alert message={error} />}

                {loading ? (
                    <Spinner text="Memuat data dashboard..." />
                ) : (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                            <Stethoscope className="h-12 w-12 text-blue-600 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800">Total Gejala</h2>
                            <p className="text-4xl font-extrabold mt-2 text-blue-700">{stats.totalGejala}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                            <FileText className="h-12 w-12 text-green-600 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800">Total Artikel</h2>
                            <p className="text-4xl font-extrabold mt-2 text-green-700">{stats.totalArtikel}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                            <Stethoscope className="h-12 w-12 text-purple-600 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800">Total Diagnosa</h2>
                            <p className="text-4xl font-extrabold mt-2 text-purple-700">{stats.totalDiagnosa}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                            <Users className="h-12 w-12 text-orange-600 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800">Total Pengguna</h2>
                            <p className="text-4xl font-extrabold mt-2 text-orange-700">{stats.totalUsers}</p>
                        </div>
                    </div>
                )}

                <div className="mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivitas Terbaru</h2>
                    <p className="text-gray-600">
                        Informasi mengenai aktivitas terbaru akan ditampilkan di sini.
                    </p>
                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center text-gray-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-400 mr-2 flex-shrink-0"></span> Diagnosa baru ditambahkan oleh User A.
                        </li>
                        <li className="flex items-center text-gray-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span> Artikel "Cara Mencegah Flu" diperbarui.
                        </li>
                        <li className="flex items-center text-gray-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-purple-400 mr-2 flex-shrink-0"></span> Pengguna baru terdaftar: User B.
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
