'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
    PlusCircle, Edit, Trash2, Loader2, AlertCircle, RefreshCw, 
    Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Quote, UploadCloud, X,
} from 'lucide-react';
import { createEditor, Editor as SlateEditor, Transforms, Text, Element as SlateElement } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';

// --- Variabel Konfigurasi & Komponen UI Dasar ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // URL base tanpa /api

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

// --- Konfigurasi dan Utilitas Slate.js ---
const HOTKEYS = { 'mod+b': 'bold', 'mod+i': 'italic', 'mod+u': 'underline' };
const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];
const toggleMark = (editor, format) => { const isActive = isMarkActive(editor, format); if (isActive) { SlateEditor.removeMark(editor, format); } else { SlateEditor.addMark(editor, format, true); } };
const isMarkActive = (editor, format) => { const marks = SlateEditor.marks(editor); return marks ? marks[format] === true : false; };
const toggleBlock = (editor, format) => { const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'); const isList = LIST_TYPES.includes(format); Transforms.unwrapNodes(editor, { match: n => !SlateEditor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type) && !TEXT_ALIGN_TYPES.includes(format), split: true, }); let newProperties; if (TEXT_ALIGN_TYPES.includes(format)) { newProperties = { align: isActive ? undefined : format }; } else { newProperties = { type: isActive ? 'paragraph' : isList ? 'list-item' : format }; } Transforms.setNodes(editor, newProperties); if (!isActive && isList) { const block = { type: format, children: [] }; Transforms.wrapNodes(editor, block); } };
const isBlockActive = (editor, format, blockType = 'type') => { const { selection } = editor; if (!selection) return false; const [match] = SlateEditor.nodes(editor, { at: SlateEditor.unhangRange(editor, selection), match: n => !SlateEditor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format, }); return !!match; };
const Element = ({ attributes, children, element }) => { const style = { textAlign: element.align }; switch (element.type) { case 'block-quote': return <blockquote className="border-l-4 pl-4 italic text-gray-500" style={style} {...attributes}>{children}</blockquote>; case 'bulleted-list': return <ul className="list-disc pl-8" style={style} {...attributes}>{children}</ul>; case 'heading-one': return <h1 className="text-3xl font-bold" style={style} {...attributes}>{children}</h1>; case 'heading-two': return <h2 className="text-2xl font-bold" style={style} {...attributes}>{children}</h2>; case 'list-item': return <li style={style} {...attributes}>{children}</li>; case 'numbered-list': return <ol className="list-decimal pl-8" style={style} {...attributes}>{children}</ol>; default: return <p style={style} {...attributes}>{children}</p>; } };
const Leaf = ({ attributes, children, leaf }) => { if (leaf.bold) { children = <strong>{children}</strong>; } if (leaf.italic) { children = <em>{children}</em>; } if (leaf.underline) { children = <u>{children}</u>; } return <span {...attributes}>{children}</span>; };
const MarkButton = ({ format, icon: Icon, editor }) => ( <button type="button" onMouseDown={event => { event.preventDefault(); toggleMark(editor, format); }} className={`p-2 rounded ${isMarkActive(editor, format) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-200`} > <Icon size={16} /> </button> );
const BlockButton = ({ format, icon: Icon, editor }) => ( <button type="button" onMouseDown={event => { event.preventDefault(); toggleBlock(editor, format); }} className={`p-2 rounded ${isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-200`} > <Icon size={16} /> </button> );
const SlateToolbar = ({ editor }) => ( <div className="flex items-center gap-2 p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg"> <MarkButton format="bold" icon={Bold} editor={editor} /> <MarkButton format="italic" icon={Italic} editor={editor} /> <MarkButton format="underline" icon={Underline} editor={editor} /> <div className="w-px h-6 bg-gray-300 mx-1"></div> <BlockButton format="heading-one" icon={Heading1} editor={editor} /> <BlockButton format="heading-two" icon={Heading2} editor={editor} /> <BlockButton format="block-quote" icon={Quote} editor={editor} /> <BlockButton format="numbered-list" icon={ListOrdered} editor={editor} /> <BlockButton format="bulleted-list" icon={List} editor={editor} /> </div> );
const SlateRichEditor = ({ value, onChange }) => { const renderElement = useCallback(props => <Element {...props} />, []); const renderLeaf = useCallback(props => <Leaf {...props} />, []); const editor = useMemo(() => withHistory(withReact(createEditor())), []); return ( <Slate editor={editor} initialValue={value} onValueChange={onChange}> <SlateToolbar editor={editor} /> <div className="p-4 min-h-[200px] focus-within:ring-2 focus-within:ring-blue-500 rounded-b-lg"> <Editable renderElement={renderElement} renderLeaf={renderLeaf} placeholder="Mulai tulis artikel Anda di sini..." spellCheck autoFocus onKeyDown={event => { for (const hotkey in HOTKEYS) { if (isHotkey(hotkey, event)) { event.preventDefault(); const mark = HOTKEYS[hotkey]; toggleMark(editor, mark); } } }} className="prose max-w-none" /> </div> </Slate> ); };
const initialSlateValue = [{ type: 'paragraph', children: [{ text: '' }] }];
const parseToSlate = (dbString) => { if (!dbString) return initialSlateValue; try { const parsed = JSON.parse(dbString); if (Array.isArray(parsed) && parsed.length > 0) { return parsed; } } catch (e) { return [{ type: 'paragraph', children: [{ text: dbString.replace(/<[^>]+>/g, '') || '' }] }]; } return initialSlateValue; };

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

// --- [FIXED] Komponen ArtikelModal dengan Scroll ---
const ArtikelModal = ({ isOpen, onClose, onSave, artikel, isSaving }) => {
    const [judul, setJudul] = useState('');
    const [konten, setKonten] = useState(initialSlateValue);
    const [gambarUrl, setGambarUrl] = useState('');
    const [gambarFile, setGambarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [formError, setFormError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (artikel) {
                setJudul(artikel.judul);
                setKonten(parseToSlate(artikel.konten));
                setGambarUrl(artikel.gambar || '');
                setPreviewUrl(artikel.gambar ? `${API_BASE_URL}${artikel.gambar}` : '');
            } else {
                setJudul('');
                setKonten(initialSlateValue);
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
        const isContentEmpty = konten.length === 1 && konten[0].children.length === 1 && konten[0].children[0].text === '';
        if (!judul.trim() || isContentEmpty) {
            setFormError('Judul dan Konten tidak boleh kosong.');
            return;
        }
        await onSave({ judul, konten, gambarFile, gambarUrlLama: gambarUrl });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            {/* PERBAIKAN: Mengubah modal menjadi flex container dengan tinggi maksimal */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]">
                {/* Header Modal (Tidak bisa di-scroll) */}
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{artikel ? 'Edit Artikel' : 'Tambah Artikel Baru'}</h2>
                </div>
                
                {/* PERBAIKAN: Form dibuat menjadi flex container agar bisa memisahkan konten dan tombol aksi */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    {/* Area Konten (Bisa di-scroll) */}
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
                                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF hingga 5MB.</p>
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
                            <div className="border border-gray-300 rounded-lg">
                               <SlateRichEditor value={konten} onChange={setKonten} />
                            </div>
                        </div>
                    </div>

                    {/* Footer Aksi (Tidak bisa di-scroll) */}
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
            {/* Tampilan Mobile (Card View) */}
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

            {/* Tampilan Desktop (Table View) */}
            <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto">
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
            const res = await fetch(`${API_BASE_URL}/api/artikel`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Gagal memuat daftar artikel.');
            
            const listData = await res.json();
            
            const articlesWithContent = await Promise.all(
                listData.map(async (article) => {
                    try {
                        const detailRes = await fetch(`${API_BASE_URL}/api/artikel/${article.slug}`);
                        if (!detailRes.ok) return article;
                        const detailData = await detailRes.json();
                        return { ...article, konten: detailData.konten };
                    } catch (e) {
                        return article;
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
        } else if (gambarUrlLama === '' || gambarUrlLama === null) {
            finalGambarUrl = null;
        } else if (!gambarFile && !gambarUrlLama) {
            finalGambarUrl = null;
        }


        const dataToSave = {
            judul: judul,
            konten: JSON.stringify(konten), 
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
                        <button onClick={fetchArticles} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
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
