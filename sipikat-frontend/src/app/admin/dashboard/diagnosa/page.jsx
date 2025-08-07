'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, AlertCircle, RefreshCw } from 'lucide-react'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const Alert = ({ message, type = 'error' }) => {
    const colors = {
        error: "bg-red-50 border-red-200 text-red-800",
        success: "bg-green-50 border-green-200 text-green-800"
    };
    return (
        <div className={`${colors[type]} px-4 py-3 rounded-lg flex items-center space-x-3 shadow-sm mb-6`} role="alert">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{message}</span>
        </div>
    );
};

const Spinner = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <p className="mt-4 text-lg">{text}</p>
    </div>
);

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-4">Hapus Riwayat</h3>
                    <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus data ini secara permanen? Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Menghapus...
                            </>
                        ) : (
                            'Ya, Hapus'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HistoryTable = ({ data, onConfirmDelete, isDeleting }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Tanggal tidak valid';
        try {
            return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(new Date(dateString));
        } catch (error) {
            return dateString;
        }
    };

    if (data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-24">
                <p className="text-xl">Belum ada riwayat diagnosa.</p>
                <p className="mt-2">Data diagnosa yang baru akan muncul di sini.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 md:hidden">
                {data.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">{item.nama}</h3>
                        <div className="text-sm text-gray-700 mb-3 space-y-1">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Usia:</span>
                                <span>{item.usia}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Jenis Kelamin:</span>
                                <span>{item.jenis_kelamin}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Provinsi:</span>
                                <span>{item.alamat}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Kategori:</span>
                                <span className="font-semibold text-blue-600">{item.kategori}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Skor CF:</span>
                                <span className="font-bold text-blue-700">{(item.total_cf * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Tanggal:</span>
                                <span>{formatDate(item.created_at)}</span>
                            </div>
                        </div>
                        <div className="flex justify-end mt-auto pt-3 border-t border-gray-200">
                            <button onClick={() => onConfirmDelete(item.id)} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1.5" disabled={isDeleting}>
                                <Trash2 size={16} /> Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Usia</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Jenis Kelamin</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Provinsi</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Kategori</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total CF (%)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((diagnosa) => (
                            <tr key={diagnosa.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{diagnosa.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{diagnosa.usia}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{diagnosa.jenis_kelamin}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{diagnosa.alamat}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{diagnosa.kategori}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">{(diagnosa.total_cf * 100).toFixed(2)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(diagnosa.created_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button onClick={() => onConfirmDelete(diagnosa.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1.5" disabled={isDeleting}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default function DiagnosaHistoryPage() {
    const [diagnosaList, setDiagnosaList] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [diagnosaToDelete, setDiagnosaToDelete] = useState(null);
    const router = useRouter();

    const fetchDiagnosa = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('adminToken');

        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/diagnosa`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Gagal memuat data.' }));
                throw new Error(errData.message || res.statusText);
            }
            const data = await res.json();
            const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setDiagnosaList(sortedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchDiagnosa();
    }, [fetchDiagnosa]);

    const confirmDeleteHandler = (id) => {
        setDiagnosaToDelete(id);
        setShowConfirmModal(true);
    };

    const cancelDeleteHandler = () => {
        setShowConfirmModal(false);
        setDiagnosaToDelete(null);
    };

    const handleDelete = async () => {
        if (!diagnosaToDelete) return;

        setIsDeleting(true);
        setError('');
        const token = localStorage.getItem('adminToken');

        try {
            const res = await fetch(`${API_BASE_URL}/diagnosa/${diagnosaToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Gagal menghapus data.' }));
                throw new Error(errData.message || res.statusText);
            }

            setDiagnosaList(prevList => prevList.filter(d => d.id !== diagnosaToDelete));

        } catch (err) {
            setError(err.message);
            fetchDiagnosa();
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setDiagnosaToDelete(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat Diagnosa</h1>
                        <p className="mt-1 text-gray-600">Daftar semua hasil diagnosa yang tercatat dalam sistem.</p>
                    </div>
                    <button
                        onClick={() => fetchDiagnosa()}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div>
                    {error && <Alert message={error} />}
                    {loading ? (
                        <Spinner text="Memuat riwayat diagnosa..." />
                    ) : (
                        <HistoryTable
                            data={diagnosaList}
                            onConfirmDelete={confirmDeleteHandler}
                            isDeleting={isDeleting}
                        />
                    )}
                </div>
            </main>

            <ConfirmationModal
                isOpen={showConfirmModal}
                onCancel={cancelDeleteHandler}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}