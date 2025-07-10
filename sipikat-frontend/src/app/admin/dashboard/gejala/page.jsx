'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, AlertCircle, RefreshCw, Plus, X } from 'lucide-react';

// --- Variabel Konfigurasi ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// --- Komponen UI Terpisah untuk Konsistensi ---

// Komponen untuk menampilkan pesan error
const Alert = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-sm mb-6" role="alert">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="font-medium">{message}</span>
    </div>
);

// Komponen untuk indikator loading
const Spinner = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
        <p className="mt-4 text-lg">{text}</p>
    </div>
);

// Komponen untuk Modal Konfirmasi Hapus
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
                    <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus gejala ini secara permanen? Tindakan ini tidak dapat dibatalkan.</p>
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

// Komponen Modal untuk form Tambah/Edit Gejala
const GejalaModal = ({ isOpen, onClose, onSave, gejala, isSaving }) => {
    // Initialize formData.mb as a string formatted to 2 decimal places
    const [formData, setFormData] = useState({ gejala: '', mb: '0.00' });

    useEffect(() => {
        if (isOpen) {
            if (gejala) {
                // When editing, format the mb value to 2 decimal places
                setFormData({ gejala: gejala.gejala, mb: Number(gejala.mb).toFixed(2) });
            } else {
                // Default value for new gejala, also formatted
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
        // Parse the mb value back to a float before saving
        onSave({ ...formData, mb: parseFloat(formData.mb) });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{gejala ? 'Edit Gejala' : 'Tambah Gejala Baru'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="gejala" className="block text-sm font-medium text-gray-700 mb-2">Teks Gejala</label>
                            <textarea 
                                id="gejala" 
                                name="gejala" 
                                value={formData.gejala} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-gray-400" 
                                required 
                                rows="4" 
                                placeholder="Contoh: Mengalami demam tinggi lebih dari 3 hari"
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="mb" className="block text-sm font-medium text-gray-700 mb-2">Nilai MB (Certainty Factor Pakar)</label>
                            <input 
                                type="number" 
                                id="mb" 
                                name="mb" 
                                value={formData.mb} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-gray-400" 
                                required 
                                step="0.01" 
                                min="0" 
                                max="1" 
                                placeholder="Contoh: 0.80"
                            />
                            <p className="text-xs text-gray-500 mt-2">Nilai antara 0.00 dan 1.00. Contoh: 0.80</p>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSaving} 
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Komponen untuk menampilkan data gejala (responsif)
const GejalaTable = ({ data, onEdit, onConfirmDelete, isActionDisabled }) => {
    if (data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-24">
                <p className="text-xl">Belum ada data gejala.</p>
                <p className="mt-2">Klik tombol "Tambah Gejala" untuk memulai.</p>
            </div>
        );
    }

    return (
        <>
            {/* Tampilan Kartu untuk Mobile */}
            <div className="space-y-4 md:hidden">
                {data.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <p className="text-gray-800 pr-4">{item.gejala}</p>
                            <span className="flex-shrink-0 font-bold text-lg text-indigo-600">{Number(item.mb).toFixed(2)}</span>
                        </div>
                        <div className="mt-4 border-t pt-3 flex justify-end space-x-4">
                             <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors" disabled={isActionDisabled}>
                                Edit
                            </button>
                            <button onClick={() => onConfirmDelete(item.id)} className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors" disabled={isActionDisabled}>
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tampilan Tabel untuk Desktop */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>{/* Moved to a single line to remove whitespace text nodes */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-16 rounded-tl-lg">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Teks Gejala</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nilai MB</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider rounded-tr-lg">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((gejala, index) => (
                            <tr key={gejala.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gejala.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{gejala.gejala}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">{Number(gejala.mb).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-4">
                                    <button onClick={() => onEdit(gejala)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors" disabled={isActionDisabled}>Edit</button>
                                    <button onClick={() => onConfirmDelete(gejala.id)} className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors" disabled={isActionDisabled}>Hapus</button>
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
    const router = useRouter();
    const [gejalaList, setGejalaList] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State untuk modal tambah/edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGejala, setEditingGejala] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // State untuk modal konfirmasi hapus
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchGejala = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            // Menggunakan kembali metode N+1 karena endpoint /admin/gejala belum tentu ada
            // Ini memastikan kompatibilitas dengan backend awal
            const listRes = await fetch(`${API_BASE_URL}/gejala`);
            if (!listRes.ok) {
                const errorData = await listRes.json().catch(() => ({ message: 'Gagal memuat daftar gejala dasar.' }));
                throw new Error(errorData.message || listRes.statusText);
            }
            const gejalaListBasic = await listRes.json();

            const detailPromises = gejalaListBasic.map(gejala =>
                fetch(`${API_BASE_URL}/gejala/${gejala.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(async res => {
                    if (res.status === 401 || res.status === 403) {
                        throw new Error('Authentication failed');
                    }
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ message: `Gagal mengambil detail untuk gejala ID: ${gejala.id}` }));
                        console.error(`Gagal mengambil detail untuk gejala ID: ${gejala.id}:`, errorData.message || res.statusText);
                        return { ...gejala, mb: 'Error' }; // Return with error placeholder
                    }
                    return res.json();
                })
            );

            const detailedGejalaList = await Promise.all(detailPromises);
            // Filter out any items that resulted in an error during detail fetch if desired, or handle 'Error' mb values
            setGejalaList(detailedGejalaList.filter(item => item.mb !== 'Error').sort((a, b) => a.id - b.id));

        } catch (err) {
            if (err.message === 'Authentication failed') {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }
            setError(err.message);
            console.error("Error fetching gejala:", err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchGejala();
    }, [fetchGejala]);

    // --- Handler untuk Modal Tambah/Edit ---
    const openModal = (gejala = null) => {
        setEditingGejala(gejala);
        setIsModalOpen(true);
        setError('');
    };

    const closeModal = () => {
        setEditingGejala(null);
        setIsModalOpen(false);
    };

    const handleSave = async (formData) => {
        setIsSaving(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        const method = editingGejala ? 'PUT' : 'POST';
        const url = editingGejala
            ? `${API_BASE_URL}/gejala/${editingGejala.id}`
            : `${API_BASE_URL}/gejala`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Gagal menyimpan data.' }));
                throw new Error(errData.message || 'Gagal menyimpan data');
            }
            
            await fetchGejala(); // Refresh the list after save
            closeModal();
        } catch (err) {
            setError(err.message);
            console.error("Error saving gejala:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Handler untuk Modal Hapus ---
    const confirmDeleteHandler = (id) => {
        setItemToDelete(id);
        setShowConfirmModal(true);
    };

    const cancelDeleteHandler = () => {
        setShowConfirmModal(false);
        setItemToDelete(null);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        setError('');
        const token = localStorage.getItem('adminToken');

        try {
            const res = await fetch(`${API_BASE_URL}/gejala/${itemToDelete}`, {
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

            setGejalaList(prevList => prevList.filter(d => d.id !== itemToDelete));
            
        } catch (err) {
            setError(err.message);
            console.error("Error deleting gejala:", err);
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-inter antialiased p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Gejala</h1>
                        <p className="mt-1 text-gray-600">Tambah, edit, atau hapus data gejala untuk sistem pakar.</p>
                    </div>
                    <div className="flex items-center gap-2">
                           <button
                                onClick={() => fetchGejala()}
                                disabled={loading || isSaving || isDeleting}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button 
                                onClick={() => openModal()} 
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || isSaving || isDeleting}
                            >
                                <Plus size={16} />
                                Tambah Gejala
                            </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    {error && <Alert message={error} />}
                    
                    {loading ? (
                        <Spinner text="Memuat data gejala..." />
                    ) : (
                        <GejalaTable
                            data={gejalaList}
                            onEdit={openModal}
                            onConfirmDelete={confirmDeleteHandler}
                            isActionDisabled={isDeleting || isSaving || loading}
                        />
                    )}
                </div>
            </main>
            
            {/* Modals */}
            <GejalaModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                gejala={editingGejala}
                isSaving={isSaving}
            />
            <ConfirmationModal
                isOpen={showConfirmModal}
                onCancel={cancelDeleteHandler}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
