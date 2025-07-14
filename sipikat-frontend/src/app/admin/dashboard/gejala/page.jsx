'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, AlertCircle, RefreshCw, Plus, X, Pencil } from 'lucide-react';

// --- Variabel Konfigurasi ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// --- Fungsi Helper ---
const formatMbValue = (mb) => {
    const value = parseFloat(mb);
    return !isNaN(value) ? value.toFixed(2) : '0.00';
};

// --- Komponen UI ---

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

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-4">Hapus Gejala</h3>
                    <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus data ini secara permanen? Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-8 flex justify-center space-x-4">
                    <button type="button" onClick={onCancel} disabled={isDeleting} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50">
                        Batal
                    </button>
                    <button type="button" onClick={onConfirm} disabled={isDeleting} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        {isDeleting ? (<><Loader2 className="animate-spin h-5 w-5 mr-2" /> Menghapus...</>) : 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GejalaModal = ({ isOpen, onClose, onSave, gejala, isSaving }) => {
    const [formData, setFormData] = useState({ gejala: '', mb: '0.10' });

    useEffect(() => {
        if (isOpen) {
            if (gejala) {
                setFormData({ gejala: gejala.gejala, mb: formatMbValue(gejala.mb) });
            } else {
                setFormData({ gejala: '', mb: '0.10' });
            }
        }
    }, [gejala, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, mb: parseFloat(formData.mb) });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{gejala ? 'Edit Gejala' : 'Tambah Gejala Baru'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="gejala" className="block text-sm font-medium text-gray-700 mb-2">Teks Gejala</label>
                        <textarea id="gejala" name="gejala" value={formData.gejala} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-gray-400" required rows="4" placeholder="Contoh: Mengalami demam tinggi lebih dari 3 hari"></textarea>
                    </div>
                    <div>
                        <label htmlFor="mb" className="block text-sm font-medium text-gray-700 mb-2">Nilai MB (Bobot Pakar)</label>
                        <input type="number" id="mb" name="mb" value={formData.mb} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" required step="0.01" min="0" max="1" />
                        <p className="text-xs text-gray-500 mt-2">Masukkan nilai antara 0.00 dan 1.00.</p>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSaving ? (<><Loader2 className="animate-spin h-5 w-5 mr-2" /> Menyimpan...</>) : 'Simpan Gejala'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const GejalaTable = ({ data, onEdit, onConfirmDelete, isActionDisabled }) => {
    if (data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-24">
                <p className="text-xl">Belum ada data gejala.</p>
                <p className="mt-2">Klik tombol "Tambah Gejala" untuk menambahkan data baru.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 md:hidden">
                {data.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-gray-800 font-medium">{item.gejala}</p>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-500">Nilai MB:</span>
                                <span className="font-bold text-indigo-700">{formatMbValue(item.mb)}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1.5" disabled={isActionDisabled}><Pencil size={16} /> Edit</button>
                            <button onClick={() => onConfirmDelete(item.id)} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1.5" disabled={isActionDisabled}><Trash2 size={16} /> Hapus</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Teks Gejala</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nilai MB</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((gejala) => (
                            <tr key={gejala.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gejala.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{gejala.gejala}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">{formatMbValue(gejala.mb)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(gejala)} className="text-indigo-600 hover:text-indigo-800 p-2 rounded-md hover:bg-indigo-50 transition-colors" disabled={isActionDisabled}><Pencil size={16} /></button>
                                    <button onClick={() => onConfirmDelete(gejala.id)} className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors" disabled={isActionDisabled}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// --- Komponen Halaman Utama ---
export default function GejalaPage() {
    const [gejalaList, setGejalaList] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGejala, setEditingGejala] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [gejalaToDelete, setGejalaToDelete] = useState(null);
    const router = useRouter();

    const fetchGejala = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            // Langkah 1: Ambil daftar gejala dasar (hanya id dan nama)
            const listRes = await fetch(`${API_BASE_URL}/gejala`);
            if (!listRes.ok) {
                throw new Error('Gagal memuat daftar gejala dasar.');
            }
            const gejalaListBasic = await listRes.json();

            // Langkah 2: Ambil detail untuk setiap gejala secara paralel
            const detailPromises = gejalaListBasic.map(gejala =>
                fetch(`${API_BASE_URL}/gejala/${gejala.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => {
                    if (res.status === 401 || res.status === 403) throw new Error('Authentication failed');
                    if (!res.ok) return null; // Abaikan jika ada error individual
                    return res.json();
                })
            );
            
            const detailedGejalaList = (await Promise.all(detailPromises)).filter(Boolean); // filter(Boolean) untuk menghapus hasil null

            setGejalaList(detailedGejalaList.sort((a, b) => a.id - b.id));

        } catch (err) {
            if (err.message === 'Authentication failed') {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [router]);


    useEffect(() => {
        fetchGejala();
    }, [fetchGejala]);

    const openModalHandler = (gejala = null) => {
        setEditingGejala(gejala);
        setIsModalOpen(true);
        setError('');
    };

    const closeModalHandler = () => {
        setIsModalOpen(false);
        setEditingGejala(null);
    };

    const handleSave = async (formData) => {
        setIsSaving(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) { router.push('/admin/login'); return; }

        const method = editingGejala ? 'PUT' : 'POST';
        const url = editingGejala ? `${API_BASE_URL}/gejala/${editingGejala.id}` : `${API_BASE_URL}/gejala`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (res.status === 401 || res.status === 403) { localStorage.removeItem('adminToken'); router.push('/admin/login'); return; }
            if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || 'Gagal menyimpan data.'); }
            
            closeModalHandler();
            await fetchGejala();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteHandler = (id) => {
        setGejalaToDelete(id);
        setShowConfirmModal(true);
    };

    const cancelDeleteHandler = () => {
        setShowConfirmModal(false);
        setGejalaToDelete(null);
    };

    const handleDelete = async () => {
        if (!gejalaToDelete) return;

        setIsDeleting(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) { router.push('/admin/login'); return; }

        try {
            const res = await fetch(`${API_BASE_URL}/gejala/${gejalaToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) { localStorage.removeItem('adminToken'); router.push('/admin/login'); return; }
            if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || 'Gagal menghapus data.'); }
            
            setGejalaList(prevList => prevList.filter(g => g.id !== gejalaToDelete));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setGejalaToDelete(null);
        }
    };

    const isActionDisabled = loading || isSaving || isDeleting;

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Gejala</h1>
                        <p className="mt-1 text-gray-600">Tambah, edit, atau hapus data gejala pada sistem.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchGejala()} disabled={isActionDisabled} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                        <button onClick={() => openModalHandler()} disabled={isActionDisabled} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                            <Plus size={16} /> Tambah Gejala
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    {error && <Alert message={error} />}
                    {loading ? <Spinner text="Memuat data gejala..." /> : 
                        <GejalaTable data={gejalaList} onEdit={openModalHandler} onConfirmDelete={confirmDeleteHandler} isActionDisabled={isActionDisabled} />
                    }
                </div>
            </main>

            <GejalaModal isOpen={isModalOpen} onClose={closeModalHandler} onSave={handleSave} gejala={editingGejala} isSaving={isSaving} />
            <ConfirmationModal isOpen={showConfirmModal} onCancel={cancelDeleteHandler} onConfirm={handleDelete} isDeleting={isDeleting} />
        </div>
    );
}