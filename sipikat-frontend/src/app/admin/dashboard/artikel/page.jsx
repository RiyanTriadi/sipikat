'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// --- Variabel Konfigurasi & Komponen UI Dasar (Alert, Spinner, etc.) ---
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

// --- Komponen Editor CKEditor (Dibuat khusus untuk Next.js) ---
const Editor = ({ value, onChange }) => {
    const editorRef = useRef(null);
    const [isEditorLoaded, setIsEditorLoaded] = useState(false);
    const { CKEditor, ClassicEditor } = editorRef.current || {};

    useEffect(() => {
        // Import dinamis untuk menghindari error SSR
        import('@ckeditor/ckeditor5-react').then(module => {
            const CKEditor = module.CKEditor;
            import('@ckeditor/ckeditor5-build-classic').then(module => {
                const ClassicEditor = module.default;
                editorRef.current = { CKEditor, ClassicEditor };
                setIsEditorLoaded(true);
            });
        });
    }, []);

    if (!isEditorLoaded) {
        return <div className="p-4 border border-gray-200 rounded-lg min-h-[200px]">Memuat editor...</div>;
    }

    return (
        <CKEditor
            editor={ClassicEditor}
            data={value}
            onChange={(event, editor) => {
                const data = editor.getData();
                onChange(data);
            }}
        />
    );
};


// --- Komponen Modal & Tabel ---

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><Trash2 className="h-6 w-6 text-red-600" /></div>
                    <h3 className="text-xl font-bold text-gray-900 mt-4">Hapus Artikel</h3>
                    <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-8 flex justify-center space-x-4">
                    <button type="button" onClick={onCancel} disabled={isDeleting} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors">Batal</button>
                    <button type="button" onClick={onConfirm} disabled={isDeleting} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50">
                        {isDeleting ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Menghapus...</> : 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ArtikelModal = ({ isOpen, onClose, onSave, artikel, isSaving }) => {
    // FIX: Tambahkan 'gambar' ke initial state
    const [formData, setFormData] = useState({ judul: '', konten: '', gambar: '' });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (artikel) {
            // FIX: Pastikan 'gambar' juga di-set saat mengedit
            setFormData({ judul: artikel.judul, konten: artikel.konten, gambar: artikel.gambar || '' });
        } else {
            // FIX: Reset semua field termasuk 'gambar'
            setFormData({ judul: '', konten: '', gambar: '' });
        }
        setFormError('');
    }, [artikel, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleEditorChange = (data) => {
        setFormData(prev => ({ ...prev, konten: data }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.judul || !formData.konten) {
            setFormError('Judul dan Konten tidak boleh kosong.');
            return;
        }
        await onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{artikel ? 'Edit Artikel' : 'Tambah Artikel Baru'}</h2>
                {formError && <Alert message={formError} />}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="judul" className="block text-gray-700 text-sm font-medium mb-2">Judul Artikel</label>
                        <input type="text" id="judul" name="judul" value={formData.judul} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    {/* FIX: Tambahkan input untuk URL gambar */}
                    <div>
                        <label htmlFor="gambar" className="block text-gray-700 text-sm font-medium mb-2">URL Gambar (Opsional)</label>
                        <input type="text" id="gambar" name="gambar" value={formData.gambar} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://contoh.com/gambar.jpg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Konten</label>
                        <div className="prose max-w-none border border-gray-300 rounded-lg overflow-hidden">
                           <Editor value={formData.konten} onChange={handleEditorChange} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50">
                            {isSaving ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Menyimpan...</> : 'Simpan Artikel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ArtikelTable = ({ data, onEdit, onDelete, isDeleting }) => {
    // Komponen ini tidak diubah
    if (data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-24">
                <p className="text-xl">Belum ada artikel yang dipublikasikan.</p>
                <p className="mt-2">Mulai buat artikel pertama Anda sekarang!</p>
            </div>
        );
    }
    const formatArticleDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(dateString));
        } catch (error) {
            return dateString;
        }
    };
    return (
        <>
            <div className="space-y-4 md:hidden">
                {data.map((artikel) => (
                    <div key={artikel.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <h3 className="font-bold text-xl text-gray-900 leading-tight mb-2">{artikel.judul}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3" dangerouslySetInnerHTML={{ __html: artikel.konten || '' }}></p>
                        <div className="flex justify-between items-center text-sm text-gray-500 mt-auto pt-3 border-t border-gray-100">
                            <span>{formatArticleDate(artikel.created_at)}</span>
                            <div className="flex space-x-3">
                                <button onClick={() => onEdit(artikel)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1" disabled={isDeleting}><Edit size={16} /> Edit</button>
                                <button onClick={() => onDelete(artikel.id)} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1" disabled={isDeleting}><Trash2 size={16} /> Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="w-2/3 px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Judul</th>
                            <th scope="col" className="w-1/4 px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tanggal Publikasi</th>
                            <th scope="col" className="w-1/12 px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((artikel) => (
                            <tr key={artikel.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate" title={artikel.judul}>{artikel.judul}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatArticleDate(artikel.created_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-4">
                                        <button onClick={() => onEdit(artikel)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5" disabled={isDeleting}><Edit size={16} /> Edit</button>
                                        <button onClick={() => onDelete(artikel.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1.5" disabled={isDeleting}><Trash2 size={16} /> Hapus</button>
                                    </div>
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
export default function ArtikelAdminPage() {
    const [articles, setArticles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArtikel, setEditingArtikel] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); 
    const [isDeleting, setIsDeleting] = useState(false); 
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [artikelToDeleteId, setArtikelToDeleteId] = useState(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/artikel`, { cache: 'no-store' });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Terjadi kesalahan saat memuat artikel.' }));
                throw new Error(errorData.message || res.statusText);
            }
            const data = await res.json();
            const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setArticles(sortedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleSave = async (formData) => {
        setIsSaving(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setError('Anda tidak memiliki izin. Silakan login kembali.');
            setIsSaving(false);
             return;
        }

        // FIX: Sertakan 'gambar' dalam payload yang dikirim ke backend
        // Kirim null jika string kosong, sesuai pesan error backend
        const dataToSave = {
            judul: formData.judul,
            konten: formData.konten,
            gambar: formData.gambar || null, 
        };

        const method = editingArtikel ? 'PUT' : 'POST';
        const url = editingArtikel
            ? `${API_BASE_URL}/artikel/${editingArtikel.id}`
            : `${API_BASE_URL}/artikel`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSave) 
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Gagal menyimpan artikel.' }));
                throw new Error(errorData.message || res.statusText);
            }
            fetchArticles(); 
            closeModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteHandler = (id) => {
        setArtikelToDeleteId(id);
        setShowConfirmDeleteModal(true);
    };

    const cancelDeleteHandler = () => {
        setShowConfirmDeleteModal(false);
        setArtikelToDeleteId(null);
    };

    const handleDelete = async () => {
        if (!artikelToDeleteId) return;
        setIsDeleting(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setError('Anda tidak memiliki izin. Silakan login kembali.');
            setIsDeleting(false);
            cancelDeleteHandler();
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/artikel/${artikelToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Gagal menghapus artikel.' }));
                throw new Error(errorData.message || res.statusText);
            }
            setArticles(prevList => prevList.filter(artikel => artikel.id !== artikelToDeleteId));
        } catch (err) {
            setError(err.message);
            fetchArticles();
        } finally {
            setIsDeleting(false);
            cancelDeleteHandler();
        }
    };

    const openModal = (artikel = null) => {
        setEditingArtikel(artikel);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingArtikel(null);
        setIsModalOpen(false);
        setError(''); 
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Artikel</h1>
                        <p className="mt-1 text-gray-600">Daftar semua artikel yang dipublikasikan di website.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={() => fetchArticles()} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
                            <PlusCircle className="h-5 w-5" />
                            Tambah Artikel
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    {error && <Alert message={error} />}
                    {loading ? (
                        <Spinner text="Memuat daftar artikel..." />
                    ) : (
                        <ArtikelTable
                            data={articles}
                            onEdit={openModal}
                            onDelete={confirmDeleteHandler}
                            isDeleting={isDeleting}
                        />
                    )}
                </div>
            </main>

            <ArtikelModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                artikel={editingArtikel}
                isSaving={isSaving}
            />

            <ConfirmationModal
                isOpen={showConfirmDeleteModal}
                onCancel={cancelDeleteHandler}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
