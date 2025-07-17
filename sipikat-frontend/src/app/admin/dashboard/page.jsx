'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LayoutDashboard, FileText, Stethoscope, Users, AlertCircle, Clock, UserPlus, FilePlus, Lightbulb } from 'lucide-react'; 
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const Alert = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-sm mb-6" role="alert">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="font-medium">{message}</span>
    </div>
);

const Spinner = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <p className="mt-4 text-lg">{text}</p>
    </div>
);


const ActivityItem = ({ activity }) => {
    const renderContent = () => {
        switch (activity.type) {
            case 'diagnosa':
                return [
                    <Stethoscope key="icon" className="h-5 w-5 text-purple-500 flex-shrink-0" />,
                    <p key="text">Diagnosa baru untuk <span className="font-semibold text-gray-800">{activity.nama}</span>.</p>
                ];
            case 'artikel':
                return [
                    <FilePlus key="icon" className="h-5 w-5 text-green-500 flex-shrink-0" />,
                    <p key="text">Artikel baru diterbitkan: <span className="font-semibold text-gray-800">"{activity.judul}"</span>.</p>
                ];
            case 'user':
                return [
                    <UserPlus key="icon" className="h-5 w-5 text-blue-500 flex-shrink-0" />,
                    <p key="text">Pengguna baru telah terdaftar: <span className="font-semibold text-gray-800">{activity.nama}</span>.</p>
                ];
            case 'solusi': 
                return [
                    <Lightbulb key="icon" className="h-5 w-5 text-yellow-500 flex-shrink-0" />,
                    <p key="text">Solusi baru ditambahkan dengan kategori: <span className="font-semibold text-gray-800">"{activity.nama}"</span>.</p>
                ];
            default:
                return [];
        }
    };

    const content = renderContent();

    return (
        <li className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-md">
            <div className="flex-shrink-0 mt-1">{content[0]}</div>
            <div className="flex-1">
                <div className="flex items-center gap-x-2 text-sm text-gray-600">
                    {content.slice(1)}
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: id })}
                </p>
            </div>
        </li>
    );
};


export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalGejala: null,
        totalArtikel: null,
        totalDiagnosa: null,
        totalUsers: null,
    });
    const [activities, setActivities] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setActivityLoading(true);
            setError('');
            const token = localStorage.getItem('adminToken');

            if (!token) {
                setError('Anda tidak terautentikasi. Silakan login kembali.');
                setLoading(false);
                setActivityLoading(false);
                router.push('/admin/login');
                return;
            }

            try {
                const fetchPromises = [
                    fetch(`${API_BASE_URL}/gejala`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/artikel`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/diagnosa`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/aktivitas/terbaru`, { headers: { 'Authorization': `Bearer ${token}` } }),
                ];

                const responses = await Promise.all(fetchPromises);
                
                const results = await Promise.all(responses.map(async (res, index) => {
                    if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem('adminToken');
                        throw new Error('Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.');
                    }
                    if (!res.ok) {
                        const entityName = ['gejala', 'artikel', 'diagnosa', 'pengguna', 'aktivitas terbaru'][index];
                        throw new Error(`Gagal memuat data ${entityName}.`);
                    }
                    return res.json();
                }));

                setStats({
                    totalGejala: results[0].length,
                    totalArtikel: results[1].length,
                    totalDiagnosa: results[2].length,
                    totalUsers: results[3].length,
                });
                setActivities(results[4]);

            } catch (err) {
                setError(err.message);
                console.error("Error fetching dashboard data:", err);
                if (err.message.includes('Sesi Anda telah berakhir') || err.message.includes('tidak terautentikasi')) {
                    router.push('/admin/login');
                }
            } finally {
                setLoading(false);
                setActivityLoading(false);
            }
        };

        fetchData();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 font-inter antialiased p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <LayoutDashboard className="h-8 w-8 text-blue-600" /> Dashboard Admin
                        </h1>
                        <p className="mt-1 text-gray-600 text-lg">Selamat datang di panel administrasi SIPIKAT. Berikut adalah ringkasan data Anda.</p>
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
                    {activityLoading ? (
                        <div className="text-center text-gray-500 py-4">Memuat aktivitas...</div>
                    ) : activities.length > 0 ? (
                        <ul className="space-y-2">
                            {activities.map(activity => (
                                <ActivityItem key={`${activity.type}-${activity.id}-${activity.created_at}`} activity={activity} />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Tidak ada aktivitas terbaru.</p>
                    )}
                </div>
            </main>
        </div>
    );
}