'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, RefreshCw, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading1, Heading2, Quote, UploadCloud, X } from 'lucide-react';

// TipTap Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// --- KOMPONEN UTILITAS ---

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

// --- KOMPONEN TIPTAP EDITOR ---

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const menuItems = [
        { type: 'button', action: () => editor.chain().focus().toggleBold().run(), icon: Bold, name: 'bold', isActive: editor.isActive('bold') },
        { type: 'button', action: () => editor.chain().focus().toggleItalic().run(), icon: Italic, name: 'italic', isActive: editor.isActive('italic') },
        { type: 'button', action: () => editor.chain().focus().toggleUnderline().run(), icon: UnderlineIcon, name: 'underline', isActive: editor.isActive('underline') },
        { type: 'divider' },
        { type: 'button', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), icon: Heading1, name: 'heading', isActive: editor.isActive('heading', { level: 1 }) },
        { type: 'button', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), icon: Heading2, name: 'heading', isActive: editor.isActive('heading', { level: 2 }) },
        { type: 'button', action: () => editor.chain().focus().toggleBlockquote().run(), icon: Quote, name: 'blockquote', isActive: editor.isActive('blockquote') },
        { type: 'button', action: () => editor.chain().focus().toggleBulletList().run(), icon: List, name: 'bulletList', isActive: editor.isActive('bulletList') },
        { type: 'button', action: () => editor.chain().focus().toggleOrderedList().run(), icon: ListOrdered, name: 'orderedList', isActive: editor.isActive('orderedList') },
    ];

    return (
        <div className="flex items-center flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
            {menuItems.map((item, index) =>
                item.type === 'divider' ? (
                    <div key={index} className="w-px h-6 bg-gray-300 mx-1"></div>
                ) : (
                    <button
                        key={index}
                        type="button"
                        onClick={item.action}
                        className={`p-2 rounded ${item.isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-200`}
                    >
                        <item.icon size={16} />
                    </button>
                )
            )}
        </div>
    );
};

// =================================================================
// PERBAIKAN UTAMA: Komponen TiptapEditor dibuat Client-Side Only
// =================================================================
const TiptapEditor = ({ content, onChange }) => {
    const [isClient, setIsClient] = useState(false);

    // useEffect hanya akan berjalan di sisi klien setelah komponen di-mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
            }),
            Underline,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-4 min-h-[200px] focus:outline-none',
            },
        },
    });
    
    // Efek untuk menyinkronkan konten dari props jika ada perubahan
    useEffect(() => {
        if (editor && editor.getHTML() !== content) {
            editor.commands.setContent(content, false);
        }
    }, [content, editor]);

    // Tampilkan placeholder loading jika belum berada di sisi klien
    if (!isClient) {
         return (
            <div className="p-4 border border-gray-300 rounded-lg min-h-[288px] bg-gray-50 animate-pulse flex items-center justify-center text-gray-500">
                Memuat editor...
            </div>
        );
    }

    return (
        <div className="border border-gray-300 rounded-lg">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

// --- KOMPONEN MODAL ---

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
    const [judul, setJudul] = useState('');
    const [konten, setKonten] = useState('');
    const [gambarUrl, setGambarUrl] = useState('');
    const [gambarFile, setGambarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [formError, setFormError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (artikel) {
                setJudul(artikel.judul);
                setKonten(artikel.konten || '');
                setGambarUrl(artikel.gambar || '');
                setPreviewUrl(artikel.gambar ? `${API_BASE_URL}${artikel.gambar}` : '');
            } else {
                setJudul('');
                setKonten('');
                setGambarUrl('');
                setPreviewUrl('');
                setGambarFile(null);
            }
            setFormError('');
        }
    }, [artikel, isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGambarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const handleRemoveImage = () => {
        setGambarFile(null);
        setGambarUrl('');
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        const plainTextContent = konten.replace(/<[^>]+>/g, '').trim();
        if (!judul.trim() || !plainTextContent) {
            setFormError('Judul dan Konten tidak boleh kosong.');
            return;
        }
        await onSave({ judul, konten, gambarFile, gambarUrlLama: gambarUrl });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{artikel ? 'Edit Artikel' : 'Tambah Artikel Baru'}</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                         <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                        {formError && <Alert message={formError} />}
                        <div>
                            <label htmlFor="judul" className="block text-gray-700 text-sm font-medium mb-2">Judul Artikel</label>
                            <input type="text" id="judul" value={judul} onChange={(e) => setJudul(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Gambar Sampul (Thumbnail)</label>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <UploadCloud className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG hingga 5MB.</p>
                                    {previewUrl && (
                                        <button type="button" onClick={handleRemoveImage} className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                                            <X size={14} /> Hapus Gambar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Konten</label>
                            <TiptapEditor
                                key={artikel ? artikel.id : 'new-article'}
                                content={konten}
                                onChange={setKonten}
                            />
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50">
                            {isSaving ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Menyimpan...</> : 'Simpan Artikel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- KOMPONEN TABEL DAN HALAMAN UTAMA ---

const ArtikelTable = ({ data, onEdit, onDelete, isDeleting }) => {
    if (data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-24">
                <p className="text-xl">Belum ada artikel yang dipublikasikan.</p>
                <p className="mt-2">Mulai buat artikel pertama Anda sekarang!</p>
            </div>
        );
    }
    const formatArticleDate = (dateString) => {
        if (!dateString) return 'Tanggal tidak valid';
        try {
            return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(dateString));
        } catch (error) {
            return dateString;
        }
    };

    return (
        <>
            {/* Mobile View */}
            <div className="space-y-4 md:hidden">
                {data.map((artikel) => (
                    <div key={artikel.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start">
                        <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border">
                            {artikel.gambar ? (
                                <img src={`${API_BASE_URL}${artikel.gambar}`} alt={artikel.judul} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UploadCloud className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col flex-grow">
                            <h3 className="font-bold text-md text-gray-900 leading-tight mb-1 line-clamp-3">{artikel.judul}</h3>
                            <p className="text-sm text-gray-500 mb-3">{formatArticleDate(artikel.created_at)}</p>
                            <div className="flex space-x-4 mt-auto">
                                <button onClick={() => onEdit(artikel)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1" disabled={isDeleting}><Edit size={14} /> Edit</button>
                                <button onClick={() => onDelete(artikel.id)} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1" disabled={isDeleting}><Trash2 size={14} /> Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-24">Gambar</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Judul</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tanggal Publikasi</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((artikel) => (
                            <tr key={artikel.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                                        {artikel.gambar ? (
                                            <img src={`${API_BASE_URL}${artikel.gambar}`} alt={artikel.judul} className="w-full h-full object-cover"/>
                                        ) : (
                                            <span className="text-xs text-gray-400">No Img</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top pt-6" title={artikel.judul}>{artikel.judul}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top pt-6">{formatArticleDate(artikel.created_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top pt-6">
                                    <div className="flex items-center justify-center space-x-4">
                                        <button onClick={() => onEdit(artikel)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5" disabled={isDeleting}><Edit size={16} /> Edit</button>
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
            const res = await fetch(`${API_BASE_URL}/api/artikel`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Gagal memuat daftar artikel.');
            
            const listData = await res.json();
            
            const articlesWithContent = await Promise.all(
                listData.map(async (article) => {
                    try {
                        const detailRes = await fetch(`${API_BASE_URL}/api/artikel/${article.slug}`);
                        if (!detailRes.ok) {
                            console.error(`Gagal memuat konten untuk artikel: ${article.slug}`);
                            return { ...article, konten: '' }; 
                        }
                        const detailData = await detailRes.json();
                        return { ...article, konten: detailData.konten || '' };
                    } catch (e) {
                        console.error(`Error saat fetch konten untuk ${article.slug}:`, e);
                        return { ...article, konten: '' };
                    }
                })
            );

            const sortedData = articlesWithContent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

    const handleSave = async ({ judul, konten, gambarFile, gambarUrlLama }) => {
        setIsSaving(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            alert('Sesi Anda telah berakhir. Silakan login kembali.');
            setIsSaving(false);
            return;
        }

        let finalGambarUrl = gambarUrlLama;

        if (gambarFile) {
            const formData = new FormData();
            formData.append('thumbnail', gambarFile);
            try {
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/thumbnail`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    throw new Error(uploadData.message || 'Gagal mengunggah gambar.');
                }
                finalGambarUrl = uploadData.filePath;
            } catch (err) {
                alert(`Error: ${err.message}`);
                setIsSaving(false);
                return;
            }
        } else if (gambarUrlLama === '') {
            finalGambarUrl = null;
        }

        const dataToSave = {
            judul: judul,
            konten: konten,
            gambar: finalGambarUrl, 
        };

        const method = editingArtikel ? 'PUT' : 'POST';
        const url = editingArtikel
            ? `${API_BASE_URL}/api/artikel/${editingArtikel.id}`
            : `${API_BASE_URL}/api/artikel`;

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
            await fetchArticles(); 
            closeModal();
        } catch (err) {
            alert(`Gagal menyimpan artikel: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteHandler = (id) => { setArtikelToDeleteId(id); setShowConfirmDeleteModal(true); };
    const cancelDeleteHandler = () => { setShowConfirmDeleteModal(false); setArtikelToDeleteId(null); };

    const handleDelete = async () => {
        if (!artikelToDeleteId) return;
        setIsDeleting(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) { setError('Anda tidak memiliki izin.'); setIsDeleting(false); cancelDeleteHandler(); return; }

        try {
            const res = await fetch(`${API_BASE_URL}/api/artikel/${artikelToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal menghapus artikel.');
            setArticles(prevList => prevList.filter(artikel => artikel.id !== artikelToDeleteId));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
            cancelDeleteHandler();
        }
    };

    const openModal = (artikel = null) => { setEditingArtikel(artikel); setIsModalOpen(true); };
    const closeModal = () => { setEditingArtikel(null); setIsModalOpen(false); };

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Artikel</h1>
                        <p className="mt-1 text-gray-600">Daftar semua artikel yang dipublikasikan di website.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            onClick={fetchArticles} 
                            disabled={loading || isSaving} 
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button 
                            onClick={() => openModal()} 
                            disabled={loading || isSaving}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Tambah Artikel
                        </button>
                    </div>
                </div>

                <div>
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