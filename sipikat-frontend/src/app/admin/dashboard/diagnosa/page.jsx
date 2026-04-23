'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, AlertCircle, RefreshCw, Eye, X } from 'lucide-react';

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

const DetailModal = ({ isOpen, onClose, diagnosa }) => {
    if (!isOpen || !diagnosa) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'Tanggal tidak valid';
        try {
            return new Intl.DateTimeFormat('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: 'UTC' 
            }).format(new Date(dateString));
        } catch (error) {
            return dateString;
        }
    };

    const parseSlateContent = (slateJSON) => {
        if (!slateJSON) return '';
        try {
            const nodes = JSON.parse(slateJSON);
            let html = '';
            
            nodes.forEach(node => {
                if (node.type === 'paragraph') {
                    let text = '';
                    node.children.forEach(child => {
                        if (child.text) {
                            if (child.bold) {
                                text += `<strong>${child.text}</strong>`;
                            } else {
                                text += child.text;
                            }
                        }
                    });
                    html += `<p class="mb-3 text-gray-700 leading-relaxed">${text}</p>`;
                } else if (node.type === 'numbered-list') {
                    html += '<ol class="list-decimal list-inside space-y-2 mb-4 ml-4">';
                    node.children.forEach(item => {
                        let itemText = '';
                        item.children.forEach(child => {
                            if (child.text) {
                                if (child.bold) {
                                    itemText += `<strong>${child.text}</strong>`;
                                } else {
                                    itemText += child.text;
                                }
                            }
                        });
                        html += `<li class="text-gray-700">${itemText}</li>`;
                    });
                    html += '</ol>';
                } else if (node.type === 'heading-two') {
                    let text = '';
                    node.children.forEach(child => {
                        if (child.text) {
                            if (child.bold) {
                                text += `<strong>${child.text}</strong>`;
                            } else {
                                text += child.text;
                            }
                        }
                    });
                    html += `<h2 class="text-xl font-bold text-gray-800 mb-3 mt-4">${text}</h2>`;
                }
            });
            
            return html;
        } catch (error) {
            console.error('Error parsing Slate content:', error);
            return '<p class="text-gray-500">Konten tidak dapat ditampilkan</p>';
        }
    };

    const getCategoryColor = (kategori) => {
        const lower = kategori.toLowerCase();
        if (lower.includes('kecanduan')) return 'bg-red-100 text-red-800 border-red-300';
        if (lower.includes('waspada')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-green-100 text-green-800 border-green-300';
    };

    const getConfidenceLabel = (cf_user) => {
        if (cf_user === 0) return 'Tidak Pernah';
        if (cf_user <= 0.33) return 'Kadang-kadang';
        if (cf_user <= 0.67) return 'Sering';
        return 'Selalu';
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Detail Diagnosa</h2>
                        <p className="text-sm text-gray-500 mt-1">ID: #{diagnosa.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Tutup modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Data Pasien</h3>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Nama Lengkap</p>
                                    <p className="text-gray-800">{diagnosa.nama}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Usia</p>
                                    <p className="text-gray-800">{diagnosa.usia} tahun</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Jenis Kelamin</p>
                                    <p className="text-gray-800">{diagnosa.jenis_kelamin}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Provinsi</p>
                                    <p className="text-gray-800">{diagnosa.alamat}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Tanggal Diagnosa</p>
                                    <p className="text-gray-800">{formatDate(diagnosa.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Hasil Diagnosa</h3>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Kategori</p>
                                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border ${getCategoryColor(diagnosa.kategori)}`}>
                                    {diagnosa.kategori.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Tingkat Kecanduan (CF Score)</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-500"
                                            style={{ width: `${(diagnosa.total_cf * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-lg font-bold text-blue-600 min-w-[70px] text-right">
                                        {(diagnosa.total_cf * 100).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Gejala yang Dialami</h3>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            {(() => {
                                let gejalaList = [];
                                try {
                                    if (typeof diagnosa.gejala_terpilih === 'string') {
                                        gejalaList = JSON.parse(diagnosa.gejala_terpilih);
                                    } else if (Array.isArray(diagnosa.gejala_terpilih)) {
                                        gejalaList = diagnosa.gejala_terpilih;
                                    }
                                } catch (error) {
                                    console.error('Error parsing gejala_terpilih:', error);
                                    gejalaList = [];
                                }

                                return gejalaList && gejalaList.length > 0 ? (
                                    <div className="space-y-3">
                                        {gejalaList.map((gejala, index) => (
                                            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                                <p className="text-gray-800 font-medium mb-2">{gejala.gejala}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">Tingkat Keyakinan:</span>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                        {getConfidenceLabel(gejala.cf_user)} ({(gejala.cf_user * 100).toFixed(0)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-center py-4">Data gejala tidak tersedia</p>
                                );
                            })()}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Rekomendasi & Solusi</h3>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <div 
                                className="prose prose-sm max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: parseSlateContent(diagnosa.solusi) }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

const HistoryTable = ({ data, onConfirmDelete, onViewDetail, isDeleting }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Tanggal tidak valid';
        try {
            return new Intl.DateTimeFormat('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: 'UTC' 
            }).format(new Date(dateString));
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
                        <div className="flex justify-end gap-2 mt-auto pt-3 border-t border-gray-200">
                            <button 
                                onClick={() => onViewDetail(item)} 
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1.5"
                            >
                                <Eye size={16} /> Detail
                            </button>
                            <button 
                                onClick={() => onConfirmDelete(item.id)} 
                                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1.5" 
                                disabled={isDeleting}
                            >
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
                                    <div className="flex items-center justify-center gap-3">
                                        <button 
                                            onClick={() => onViewDetail(diagnosa)} 
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
                                            title="Lihat Detail"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onConfirmDelete(diagnosa.id)} 
                                            className="text-red-600 hover:text-red-800 flex items-center gap-1.5" 
                                            disabled={isDeleting}
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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

export default function DiagnosaHistoryPage() {
    const [diagnosaList, setDiagnosaList] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [diagnosaToDelete, setDiagnosaToDelete] = useState(null);
    const [selectedDiagnosa, setSelectedDiagnosa] = useState(null);
    const router = useRouter();

    const fetchDiagnosa = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/diagnosa`, {
                credentials: 'include'
            });

            if (res.status === 401 || res.status === 403) {
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

        try {
            const res = await fetch(`${API_BASE_URL}/api/diagnosa/${diagnosaToDelete}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.status === 401 || res.status === 403) {
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

    const handleViewDetail = (diagnosa) => {
        setSelectedDiagnosa(diagnosa);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedDiagnosa(null);
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
                            onViewDetail={handleViewDetail}
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

            <DetailModal
                isOpen={showDetailModal}
                onClose={handleCloseDetail}
                diagnosa={selectedDiagnosa}
            />
        </div>
    );
}
