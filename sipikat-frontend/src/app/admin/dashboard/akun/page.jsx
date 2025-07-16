'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Edit, Trash2, AlertCircle, UserPlus, Pencil, X, Mail, RefreshCw } from 'lucide-react';

// --- Variabel Konfigurasi ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// --- Komponen UI Umum ---

// Komponen untuk menampilkan pesan error
const Alert = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm mb-6" role="alert">
        <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="font-medium">{message}</span>
        </div>
        {onClose && (
             <button onClick={onClose} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100">
                 <X size={20} />
            </button>
        )}
    </div>
);

// Komponen untuk indikator loading
const Spinner = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
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
                    <h3 className="text-xl font-bold text-gray-900 mt-4">Hapus Akun</h3>
                    <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus akun ini secara permanen? Tindakan ini tidak dapat dibatalkan.</p>
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

// Komponen Modal untuk Tambah/Edit Akun
const AkunModal = ({ isOpen, onClose, onSave, user, isSaving }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({ name: user.name, email: user.email, password: '' });
            } else {
                setFormData({ name: '', email: '', password: '' });
            }
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (user && !dataToSave.password) {
            delete dataToSave.password;
        }
        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{user ? 'Edit Akun Admin' : 'Tambah Akun Admin Baru'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                        <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder={user ? 'Kosongkan jika tidak diubah' : 'Wajib diisi'} required={!user} />
                        {user && <p className="text-xs text-gray-500 mt-2">Biarkan kosong jika Anda tidak ingin mengubah password.</p>}
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors duration-200">
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
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

// --- [UPDATED] Komponen Tabel Akun yang Responsif dan Konsisten ---
const AkunTable = ({ users, onEdit, onDelete, isActionDisabled }) => {
    if (users.length === 0) {
        return (
            <div className="text-center text-gray-500 py-24">
                <p className="text-xl font-semibold">Belum ada data akun.</p>
                <p className="mt-2 text-gray-600">Klik tombol "Tambah Akun" untuk memulai.</p>
            </div>
        );
    }

    return (
        <>
            {/* Tampilan Kartu untuk Mobile (Konsisten dengan halaman Gejala) */}
            <div className="space-y-4 md:hidden">
                {users.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        {/* Konten utama: Nama */}
                        <p className="text-gray-900 font-semibold text-lg">{user.name}</p>
                        
                        {/* Detail: ID dan Email */}
                        <div className="mt-3 text-sm text-gray-700 space-y-2 pt-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-500">ID Akun:</span>
                                <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{user.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-500">Email:</span>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <Mail size={14} />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Aksi */}
                        <div className="mt-4 pt-3 flex justify-end space-x-2">
                            <button 
                                onClick={() => onEdit(user)} 
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1.5 p-2 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50" 
                                disabled={isActionDisabled}
                            >
                                <Edit size={14} />
                                <span>Edit</span>
                            </button>
                            <button 
                                onClick={() => onDelete(user.id)} 
                                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1.5 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50" 
                                disabled={isActionDisabled}
                            >
                                <Trash2 size={14} />
                                <span>Hapus</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tampilan Tabel untuk Desktop */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-16 rounded-tl-lg">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider rounded-tr-lg">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-4 flex items-center justify-center">
                                    <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5" disabled={isActionDisabled}><Edit size={16} /> 
                                        Edit
                                    </button>
                                    <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1.5" disabled={isActionDisabled}><Trash2 size={16} /> 
                                        Hapus
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


// --- Komponen Halaman Utama ---
export default function AkunPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Gagal memuat data akun.' }));
                throw new Error(errData.message || res.statusText);
            }
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSave = async (formData) => {
        setIsSaving(true);
        setError('');
        const token = localStorage.getItem('adminToken');
        const method = editingUser ? 'PUT' : 'POST';
        const url = editingUser
            ? `${API_BASE_URL}/admin/users/${editingUser.id}`
            : `${API_BASE_URL}/admin/users`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal menyimpan akun');
            }
            await fetchUsers();
            closeModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        setError('');
        const token = localStorage.getItem('adminToken');

        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${userToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
             if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Gagal menghapus akun.' }));
                throw new Error(errData.message || res.statusText);
            }
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setUserToDelete(null);
        }
    };

    const openModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
        setError('');
    };

    const closeModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const confirmDeleteHandler = (id) => {
        setUserToDelete(id);
        setShowConfirmModal(true);
    };

    const cancelDeleteHandler = () => {
        setShowConfirmModal(false);
        setUserToDelete(null);
    };

    const isActionDisabled = isSaving || isDeleting || loading;

    return (
        <div className="min-h-screen bg-gray-50 font-inter antialiased p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Akun Admin</h1>
                        <p className="mt-1 text-gray-600">Tambah, edit, atau hapus akun administrator sistem.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                                onClick={() => fetchUsers()}
                                disabled={isActionDisabled}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => openModal()}
                            disabled={isActionDisabled}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserPlus size={16} />
                            Tambah Akun
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    {error && <Alert message={error} onClose={() => setError('')} />}

                    {loading ? (
                        <Spinner text="Memuat data akun..." />
                    ) : (
                        <AkunTable
                            users={users}
                            onEdit={openModal}
                            onDelete={confirmDeleteHandler}
                            isActionDisabled={isActionDisabled}
                        />
                    )}
                </div>
            </main>

            <AkunModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                user={editingUser}
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
