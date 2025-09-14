'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, RefreshCw, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Quote, UploadCloud, X } from 'lucide-react';

// Pastikan variabel lingkungan ini diakses dengan benar
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

// Fungsi untuk mengonversi HTML ke format JSON
const parseHtmlToSlate = (htmlString) => {
    if (!htmlString || htmlString.trim() === '') {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${htmlString}</div>`, 'text/html');
    const root = doc.body.firstChild;

    const result = [];

    const parseChildren = (node) => {
        const children = [];
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                if (child.textContent.trim().length > 0) {
                    children.push({ text: child.textContent });
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                let text = child.textContent || '';
                const marks = {};
                if (child.tagName.toLowerCase() === 'strong' || child.tagName.toLowerCase() === 'b') marks.bold = true;
                if (child.tagName.toLowerCase() === 'em' || child.tagName.toLowerCase() === 'i') marks.italic = true;
                if (child.tagName.toLowerCase() === 'u') marks.underline = true;
                
                const childNodes = parseChildren(child);
                if (childNodes.length > 0) {
                    childNodes.forEach(cn => {
                        children.push({ ...cn, ...marks });
                    });
                } else if (text.length > 0) {
                    children.push({ text, ...marks });
                }
            }
        });
        return children;
    };
    
    Array.from(root.childNodes).forEach(el => {
        if (el.nodeType === Node.ELEMENT_NODE) {
            const tagName = el.tagName.toLowerCase();
            if (tagName === 'ul' || tagName === 'ol') {
                const listItems = Array.from(el.childNodes)
                    .filter(li => li.nodeType === Node.ELEMENT_NODE && li.tagName.toLowerCase() === 'li')
                    .map(li => ({
                        type: 'list-item',
                        children: parseChildren(li)
                    }));
                if (listItems.length > 0) {
                    result.push({
                        type: tagName === 'ul' ? 'bulleted-list' : 'numbered-list',
                        children: listItems
                    });
                }
            } else {
                const typeMap = {
                    'h1': 'heading-one',
                    'h2': 'heading-two',
                    'blockquote': 'block-quote',
                    'p': 'paragraph',
                };
                const type = typeMap[tagName] || 'paragraph';
                const children = parseChildren(el);
                if (children.length > 0) {
                    result.push({ type, children });
                } else {
                    result.push({ type, children: [{ text: '' }] });
                }
            }
        }
    });

    if (result.length === 0) {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    return result;
};

// Fungsi untuk mengonversi JSON kembali ke HTML
const parseToHtml = (slateValue) => {
    if (!slateValue) return '';
    try {
        const parsed = typeof slateValue === 'string' ? JSON.parse(slateValue) : slateValue;
        if (!Array.isArray(parsed)) return parsed.toString();

        return parsed.map(node => {
            if (node.type === 'bulleted-list' || node.type === 'numbered-list') {
                const tag = node.type === 'bulleted-list' ? 'ul' : 'ol';
                const listItems = node.children.map(li => `<li>${li.children.map(c => {
                    let text = c.text;
                    if (c.bold) text = `<strong>${text}</strong>`;
                    if (c.italic) text = `<em>${text}</em>`;
                    if (c.underline) text = `<u>${text}</u>`;
                    return text;
                }).join('')}</li>`).join('');
                return `<${tag}>${listItems}</${tag}>`;
            }

            const childrenHtml = node.children.map(c => {
                let text = c.text;
                if (c.bold) text = `<strong>${text}</strong>`;
                if (c.italic) text = `<em>${text}</em>`;
                if (c.underline) text = `<u>${text}</u>`;
                return text;
            }).join('');
            
            const tagMap = {
                'heading-one': 'h1',
                'heading-two': 'h2',
                'block-quote': 'blockquote',
                'paragraph': 'p',
            };
            const tag = tagMap[node.type] || 'p';
            return `<${tag}>${childrenHtml}</${tag}>`;
        }).join('');
    } catch (e) {
        console.error('Failed to parse to HTML:', e);
        return '';
    }
};

const RichTextEditor = ({ value, onChange }) => {
    const editorRef = useRef(null);
    const isInternallyChanging = useRef(false);

    useEffect(() => {
        if (editorRef.current && !isInternallyChanging.current) {
            editorRef.current.innerHTML = parseToHtml(value);
        }
        isInternallyChanging.current = false;
    }, [value]);

    const handleCommand = (command, val = null) => {
        editorRef.current.focus();
        isInternallyChanging.current = true;
        
        try {
            if (command === 'formatBlock' && val) {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const parent = range.startContainer.parentElement;
                    const isAlreadyFormatted = parent && parent.tagName && parent.tagName.toLowerCase() === val.toLowerCase();
                    
                    if (isAlreadyFormatted) {
                        document.execCommand('formatBlock', false, 'p');
                    } else {
                        document.execCommand('formatBlock', false, val);
                    }
                }
            } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const parent = range.startContainer.parentElement;
                    const isAlreadyList = parent && (parent.tagName.toLowerCase() === 'ul' || parent.tagName.toLowerCase() === 'ol');
                    
                    if (isAlreadyList) {
                        document.execCommand('outdent');
                    } else {
                        document.execCommand(command);
                    }
                }
            } else {
                document.execCommand(command, false, val);
            }
        } catch (e) {
            console.error('execCommand failed:', e);
        }
        
        onChange(editorRef.current.innerHTML);
    };

    const handleInput = () => {
        isInternallyChanging.current = true;
        onChange(editorRef.current.innerHTML);
    };

    return (
        <div>
            <div className="flex items-center flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleCommand('bold'); }} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-200"><Bold size={16} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleCommand('italic'); }} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-200"><Italic size={16} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleCommand('underline'); }} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-200"><Underline size={16} /></button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleCommand('formatBlock', 'H1'); }} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-200"><Heading1 size={16} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleCommand('formatBlock', 'H2'); }} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-200"><Heading2 size={16} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleCommand('insertUnorderedList'); }} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-200"><List size={16} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleCommand('insertOrderedList'); }} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-200"><ListOrdered size={16} /></button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="prose max-w-none p-4 min-h-[200px] focus-within:ring-2 focus-within:ring-blue-500 rounded-b-lg"
            />
        </div>
    );
};

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

const ArtikelModal = ({ isOpen, onClose, onSave, artikel, isSaving, isModalLoading }) => {
    const [judul, setJudul] = useState('');
    const [konten, setKonten] = useState('');
    const [gambarUrl, setGambarUrl] = useState('');
    const [gambarFile, setGambarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [formError, setFormError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && !isModalLoading) {
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
    }, [artikel, isOpen, isModalLoading]);

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
        if (!judul.trim() || !konten.trim()) {
            setFormError('Judul dan Konten tidak boleh kosong.');
            return;
        }
        onSave({ judul, konten, gambarFile, gambarUrlLama: gambarUrl });
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
                
                {isModalLoading ? (
                    <Spinner text="Memuat konten artikel..." />
                ) : (
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
                                <div className="border border-gray-300 rounded-lg">
                                    <RichTextEditor value={konten} onChange={setKonten} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                            <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Batal</button>
                            <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50">
                                {isSaving ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Menyimpan...</> : 'Simpan Artikel'}
                            </button>
                        </div>
                    </form>
                )}
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
                                <button onClick={() => onEdit(artikel.slug)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1" disabled={isDeleting}><Edit size={14} /> Edit</button>
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
                                        <button onClick={() => onEdit(artikel.slug)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5" disabled={isDeleting}><Edit size={16} /> Edit</button>
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
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [modalKey, setModalKey] = useState(0);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/artikel`, { cache: 'no-store' });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Gagal memuat daftar artikel.');
            }
            const listData = await res.json();
            const sortedData = listData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
            setError('Sesi Anda telah berakhir. Silakan login kembali.');
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
                setError(`Error: ${err.message}`);
                setIsSaving(false);
                return;
            }
        } else if (gambarUrlLama === '' || gambarUrlLama === null) {
            finalGambarUrl = null;
        } else if (!gambarFile && !gambarUrlLama) {
            finalGambarUrl = null;
        }
        
        // Convert HTML content from rich editor to a simple Slate-like JSON structure
        const slateContent = parseHtmlToSlate(konten);

        const dataToSave = {
            judul: judul,
            konten: JSON.stringify(slateContent), 
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
            fetchArticles(); 
            closeModal();
        } catch (err) {
            setError(`Gagal menyimpan artikel: ${err.message}`);
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
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Gagal menghapus artikel.');
            }
            setArticles(prevList => prevList.filter(artikel => artikel.id !== artikelToDeleteId));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
            cancelDeleteHandler();
        }
    };

    const handleOpenModal = useCallback(async (slug = null) => {
        setModalKey(prevKey => prevKey + 1);
        setIsModalOpen(true);
        setEditingArtikel(null);
        setIsModalLoading(true);

        if (slug) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/artikel/${slug}`, { cache: 'no-store' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Gagal memuat detail artikel.');
                }
                const detailData = await res.json();
                setEditingArtikel(detailData);
            } catch (err) {
                setError(err.message);
                setIsModalOpen(false);
            } finally {
                setIsModalLoading(false);
            }
        } else {
            setIsModalLoading(false);
        }
    }, []);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingArtikel(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
            <style>
                {`
                .prose h1 {
                    font-size: 2.25rem; /* 36px */
                    font-weight: 700; /* bold */
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                .prose h2 {
                    font-size: 1.5rem; /* 24px */
                    font-weight: 600; /* semibold */
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .prose ul, .prose ol {
                    margin-top: 1rem;
                    margin-bottom: 1rem;
                    padding-left: 1.5rem;
                }
                .prose ul {
                    list-style-type: disc;
                }
                .prose ol {
                    list-style-type: decimal;
                }
                .prose li {
                    margin-bottom: 0.5rem;
                }
                `}
            </style>
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
                            onClick={() => handleOpenModal()} 
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
                            onEdit={handleOpenModal}
                            onDelete={confirmDeleteHandler}
                            isDeleting={isDeleting}
                        />
                    )}
                </div>
            </main>

            <ArtikelModal
                key={modalKey}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                artikel={editingArtikel}
                isSaving={isSaving}
                isModalLoading={isModalLoading}
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
