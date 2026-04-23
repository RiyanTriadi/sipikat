'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Edit, Trash2, AlertCircle, UserPlus, RefreshCw, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Alert = ({ message }) => (
    <div className="bg-red-50 border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-sm mb-6" role="alert">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">{message}</span>
    </div>
);

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
                    <h3 className="text-xl font-bold text-gray-900 mt-4">Hapus Akun</h3>
                    <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus akun ini secara permanen? Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{user ? 'Edit Akun Admin' : 'Tambah Akun Admin Baru'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder={user ? 'Kosongkan jika tidak diubah' : 'Wajib diisi'} required={!user} />
                            {user && <p className="text-xs text-gray-500 mt-2">Biarkan kosong jika Anda tidak ingin mengubah password.</p>}
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50">
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Menyimpan...
                                </>
                            ) : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AkunTable = ({ users, onEdit, onDelete, isActionDisabled }) => {
    if (users.length === 0) {
        return (
            <div className="text-center text-gray-500 py-24">
                <p className="text-xl font-semibold">Belum ada data akun.</p>
                <p className="mt-2">Klik tombol "Tambah Akun" untuk memulai.</p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile View */}
            <div className="space-y-4 md:hidden">
                {users.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <p className="font-bold text-lg text-gray-900 leading-tight mb-1">{user.name}</p>
                        <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                        <div className="text-xs text-gray-500 mb-3">ID Akun: {user.id}</div>
                        <div className="flex space-x-4 mt-auto">
                            <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1" disabled={isActionDisabled}><Edit size={14} /> Edit</button>
                            <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1" disabled={isActionDisabled}><Trash2 size={14} /> Hapus</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex items-center justify-center space-x-4">
                                        <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5" disabled={isActionDisabled}><Edit size={16} /> Edit</button>
                                        <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1.5" disabled={isActionDisabled}><Trash2 size={16} /> Hapus</button>
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

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
                credentials: 'include'
            });
            
            if (res.status === 401 || res.status === 403) {
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
        
        const method = editingUser ? 'PUT' : 'POST';
        const url = editingUser
            ? `${API_BASE_URL}/api/admin/users/${editingUser.id}`
            : `${API_BASE_URL}/api/admin/users`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            
            if (!res.ok) {
                const errData = await res.json();
                alert(`Gagal menyimpan: ${errData.message || 'Terjadi kesalahan'}`);
                throw new Error(errData.message || 'Gagal menyimpan akun');
            }
            
            await fetchUsers();
            closeModal();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userToDelete}`, {
                method: 'DELETE',
                credentials: 'include'
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
    
    const openModal = (user = null) => { setEditingUser(user); setIsModalOpen(true); setError(''); };
    const closeModal = () => { setEditingUser(null); setIsModalOpen(false); };
    const confirmDeleteHandler = (id) => { setUserToDelete(id); setShowConfirmModal(true); };
    const cancelDeleteHandler = () => { setShowConfirmModal(false); setUserToDelete(null); };

    const isActionDisabled = isSaving || isDeleting || loading;

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Akun Admin</h1>
                        <p className="mt-1 text-gray-600">Tambah, edit, atau hapus akun administrator sistem.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => fetchUsers()}
                            disabled={isActionDisabled}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => openModal()}
                            disabled={isActionDisabled}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <UserPlus size={16} />
                            Tambah Akun
                        </button>
                    </div>
                </div>

                <div>
                    {error && <Alert message={error} />}

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
