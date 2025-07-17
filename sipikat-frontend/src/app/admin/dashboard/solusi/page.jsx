'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import {
    PlusCircle, Edit, Trash2, Loader2, AlertCircle, RefreshCw,
    Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Quote, X,
} from 'lucide-react';
import { createEditor, Editor as SlateEditor, Transforms, Text, Element as SlateElement } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';

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

const HOTKEYS = { 'mod+b': 'bold', 'mod+i': 'italic', 'mod+u': 'underline' };
const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    SlateEditor.removeMark(editor, format);
  } else {
    SlateEditor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor, format) => {
  const marks = SlateEditor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !SlateEditor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });

  let newProperties;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = { align: isActive ? undefined : format };
  } else {
    newProperties = { type: isActive ? 'paragraph' : isList ? 'list-item' : format };
  }
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = SlateEditor.nodes(editor, {
    at: SlateEditor.unhangRange(editor, selection),
    match: n =>
      !SlateEditor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n[blockType] === format,
  });

  return !!match;
};

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote className="border-l-4 pl-4 italic text-gray-500" style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul className="list-disc pl-8" style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 className="text-3xl font-bold" style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 className="text-2xl font-bold" style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol className="list-decimal pl-8" style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

const MarkButton = ({ format, icon: Icon, editor }) => (
  <button
    type="button"
    onMouseDown={event => {
      event.preventDefault();
      toggleMark(editor, format);
    }}
    className={`p-2 rounded ${isMarkActive(editor, format) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-200`}
  >
    <Icon size={16} />
  </button>
);

const BlockButton = ({ format, icon: Icon, editor }) => (
  <button
    type="button"
    onMouseDown={event => {
      event.preventDefault();
      toggleBlock(editor, format);
    }}
    className={`p-2 rounded ${isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-200`}
  >
    <Icon size={16} />
  </button>
);

const SlateToolbar = ({ editor }) => (
  <div className="flex items-center flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
    <MarkButton format="bold" icon={Bold} editor={editor} />
    <MarkButton format="italic" icon={Italic} editor={editor} />
    <MarkButton format="underline" icon={Underline} editor={editor} />
    <div className="w-px h-6 bg-gray-300 mx-1"></div>
    <BlockButton format="heading-one" icon={Heading1} editor={editor} />
    <BlockButton format="heading-two" icon={Heading2} editor={editor} />
    <BlockButton format="block-quote" icon={Quote} editor={editor} />
    <BlockButton format="numbered-list" icon={ListOrdered} editor={editor} />
    <BlockButton format="bulleted-list" icon={List} editor={editor} />
  </div>
);

const SlateRichEditor = ({ value, onChange }) => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate editor={editor} initialValue={value} onValueChange={onChange}>
      <SlateToolbar editor={editor} />
      <div className="p-4 min-h-[200px] focus-within:ring-2 focus-within:ring-blue-500 rounded-b-lg">
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Mulai tulis solusi di sini..."
          spellCheck
          autoFocus
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
          className="prose max-w-none"
        />
      </div>
    </Slate>
  );
};

const initialSlateValue = [{ type: 'paragraph', children: [{ text: '' }] }];

const parseToSlate = (dbString) => {
  if (!dbString) return initialSlateValue;
  try {
    const parsed = JSON.parse(dbString);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    return [{ type: 'paragraph', children: [{ text: dbString.replace(/<[^>]+>/g, '') || '' }] }];
  }
  return initialSlateValue;
};

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><Trash2 className="h-6 w-6 text-red-600" /></div>
                    <h3 className="text-xl font-bold text-gray-900 mt-4">Hapus Solusi</h3>
                    <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus solusi ini? Tindakan ini tidak dapat dibatalkan.</p>
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

const SolusiModal = ({ isOpen, onClose, onSave, solusi, isSaving }) => {
    const [kategori, setKategori] = useState('');
    const [kontenSolusi, setKontenSolusi] = useState(initialSlateValue);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (solusi) {
                setKategori(solusi.kategori);
                setKontenSolusi(parseToSlate(solusi.solusi));
            } else {
                setKategori('');
                setKontenSolusi(initialSlateValue);
            }
            setFormError('');
        }
    }, [solusi, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        const isContentEmpty = kontenSolusi.length === 1 && kontenSolusi[0].children.length === 1 && kontenSolusi[0].children[0].text === '';
        if (!kategori.trim() || isContentEmpty) {
            setFormError('Kategori dan Solusi tidak boleh kosong.');
            return;
        }
        await onSave({ kategori, solusi: kontenSolusi });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{solusi ? 'Edit Solusi' : 'Tambah Solusi Baru'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                        {formError && <Alert message={formError} />}
                        <div>
                            <label htmlFor="kategori" className="block text-gray-700 text-sm font-medium mb-2">Kategori Solusi</label>
                            <input type="text" id="kategori" value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Detail Solusi</label>
                            <div className="border border-gray-300 rounded-lg">
                                <SlateRichEditor value={kontenSolusi} onChange={setKontenSolusi} />
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50">
                            {isSaving ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Menyimpan...</> : 'Simpan Solusi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SolusiTable = ({ data, onEdit, onDelete, isDeleting }) => {
    if (data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-24">
                <p className="text-xl">Belum ada solusi yang ditambahkan.</p>
                <p className="mt-2">Mulai tambahkan solusi sekarang!</p>
            </div>
        );
    }
    const formatDate = (dateString) => {
        if (!dateString) return 'Tanggal tidak valid';
        try {
            return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(new Date(dateString));
        } catch (error) {
            return dateString;
        }
    };

    const renderSolusiContent = (solusiJsonString) => {
        try {
            const parsedContent = JSON.parse(solusiJsonString);
            if (!Array.isArray(parsedContent)) return <p>Konten tidak valid.</p>;

            return parsedContent.map((node, i) => {
                if (node.type === 'paragraph' || !node.type) {
                    return <p key={i}>{node.children.map(child => child.text).join('')}</p>;
                }
                return <p key={i}>{node.children.map(child => child.text).join('')}</p>;
            });
        } catch (e) {
            return <p>{solusiJsonString || 'Tidak ada konten.'}</p>;
        }
    };

    return (
        <>
            <div className="space-y-4 md:hidden">
                {data.map((solusi) => (
                    <div key={solusi.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">{solusi.kategori}</h3>
                        <div className="text-sm text-gray-700 mb-3 prose max-w-none">
                            {renderSolusiContent(solusi.solusi)}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Diperbarui: {formatDate(solusi.updated_at)}</p>
                        <div className="flex space-x-4 mt-auto">
                            <button onClick={() => onEdit(solusi)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1" disabled={isDeleting}><Edit size={14} /> Edit</button>
                            <button onClick={() => onDelete(solusi.id)} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1" disabled={isDeleting}><Trash2 size={14} /> Hapus</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/5">Kategori</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-2/3">Solusi</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Terakhir Diperbarui</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((solusi) => (
                            <tr key={solusi.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top pt-6">{solusi.kategori}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 align-top pt-6 prose max-w-none">
                                    {renderSolusiContent(solusi.solusi)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top pt-6">{formatDate(solusi.updated_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top pt-6">
                                    <div className="flex items-center justify-center space-x-4">
                                        <button onClick={() => onEdit(solusi)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5" disabled={isDeleting}><Edit size={16} /> Edit</button>
                                        <button onClick={() => onDelete(solusi.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1.5" disabled={isDeleting}><Trash2 size={16} /> Hapus</button>
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

export default function SolusiAdminPage() {
    const [solusiList, setSolusiList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSolusi, setEditingSolusi] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [solusiToDeleteId, setSolusiToDeleteId] = useState(null);
    const router = useRouter(); 

    const fetchSolusi = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/admin/login');
                return; 
            }
            const res = await fetch(`${API_BASE_URL}/api/solusi`, {
                cache: 'no-store',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    router.push('/admin/login'); 
                    return; 
                }
                throw new Error('Gagal memuat daftar solusi.');
            }

            const data = await res.json();
            setSolusiList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [router]); 

    useEffect(() => {
        fetchSolusi();
    }, [fetchSolusi]);

    const handleSave = async ({ kategori, solusi }) => {
        setIsSaving(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login'); 
            setIsSaving(false);
            return;
        }

        const dataToSave = {
            kategori: kategori,
            solusi: JSON.stringify(solusi),
        };

        const method = editingSolusi ? 'PUT' : 'POST';
        const url = editingSolusi
            ? `${API_BASE_URL}/api/solusi/${editingSolusi.id}`
            : `${API_BASE_URL}/api/solusi`;

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
                if (res.status === 401 || res.status === 403) {
                    router.push('/admin/login'); 
                    return;
                }
                const errorData = await res.json().catch(() => ({ message: 'Gagal menyimpan solusi.' }));
                throw new Error(errorData.message || res.statusText);
            }
            await fetchSolusi();
            closeModal();
        } catch (err) {
            alert(`Gagal menyimpan solusi: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteHandler = (id) => { setSolusiToDeleteId(id); setShowConfirmDeleteModal(true); };
    const cancelDeleteHandler = () => { setShowConfirmDeleteModal(false); setSolusiToDeleteId(null); };

    const handleDelete = async () => {
        if (!solusiToDeleteId) return;
        setIsDeleting(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login'); 
            setIsDeleting(false);
            cancelDeleteHandler();
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/solusi/${solusiToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    router.push('/admin/login'); 
                    return;
                }
                throw new Error('Gagal menghapus solusi.');
            }
            setSolusiList(prevList => prevList.filter(solusi => solusi.id !== solusiToDeleteId));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
            cancelDeleteHandler();
        }
    };

    const openModal = (solusi = null) => { setEditingSolusi(solusi); setIsModalOpen(true); };
    const closeModal = () => { setEditingSolusi(null); setIsModalOpen(false); };

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Solusi</h1>
                        <p className="mt-1 text-gray-600">Daftar semua solusi yang digunakan untuk hasil diagnosa.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={fetchSolusi} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                            <PlusCircle className="h-5 w-5" />
                            Tambah Solusi
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    {error && <Alert message={error} />}
                    {loading ? (
                        <Spinner text="Memuat daftar solusi..." />
                    ) : (
                        <SolusiTable
                            data={solusiList}
                            onEdit={openModal}
                            onDelete={confirmDeleteHandler}
                            isDeleting={isDeleting}
                        />
                    )}
                </div>
            </main>

            <SolusiModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                solusi={editingSolusi}
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