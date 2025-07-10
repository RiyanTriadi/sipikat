// src/app/(user)/diagnosa/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ClipboardList, Send, Loader2, AlertCircle } from 'lucide-react';

const confidenceLevels = [
    { label: "Tidak", value: 0 }, { label: "Jarang", value: 0.2 },
    { label: "Kadang kadang", value: 0.4 }, { label: "Sering", value: 0.6 },
    { label: "Sangat sering", value: 0.8 }, { label: "Selalu", value: 1.0 },
];

const namaKampung = ["Leuwi Kolot", "Tegalwangi", "Cibuntu", "Cilaja", "Ciparay", "Pasirpeuteuy"];

const Alert = ({ message, type = 'error' }) => {
    const baseClasses = "px-4 py-3 rounded-md relative text-center text-sm font-medium shadow-sm mb-6 flex items-center justify-center space-x-2";
    const typeClasses = type === 'error' 
        ? 'bg-red-50 border border-red-300 text-red-700' 
        : 'bg-green-50 border border-green-300 text-green-700';
    const iconColor = type === 'error' ? 'text-red-500' : 'text-green-500';

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <AlertCircle className={`h-5 w-5 ${iconColor}`} />
            <p>{message}</p>
        </div>
    );
};

export default function DiagnosaPage() {
    const [user, setUser] = useState({ nama: '', jenis_kelamin: '', usia: '', alamat: '' });
    const [gejala, setGejala] = useState([]);
    const [selectedGejala, setSelectedGejala] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [gejalaLoading, setGejalaLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchGejala = async () => {
            setGejalaLoading(true);
            setError('');
            try {
                const res = await fetch('http://localhost:5000/api/gejala');
                if (!res.ok) throw new Error('Gagal mengambil data gejala dari server.');
                const data = await res.json();
                setGejala(data);
                const initialSelected = {};
                data.forEach(g => { initialSelected[g.id] = 0; });
                setSelectedGejala(initialSelected);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching gejala:", err);
            } finally {
                setGejalaLoading(false);
            }
        };
        fetchGejala();
    }, []);

    const handleUserChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
    const handleGejalaChange = (gejalaId, cf_user) => setSelectedGejala(prev => ({ ...prev, [gejalaId]: cf_user }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user.nama || !user.usia || !user.alamat || !user.jenis_kelamin) {
            setError('Harap isi semua data diri.');
            return;
        }
        const selectedSymptoms = Object.entries(selectedGejala)
            .filter(([, cf_user]) => cf_user > 0)
            .map(([id, cf_user]) => ({ id: parseInt(id), cf_user: parseFloat(cf_user) }));
        if (selectedSymptoms.length === 0) {
            setError('Harap pilih minimal satu gejala dengan tingkat keyakinan selain "Tidak".');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/diagnosa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, selectedSymptoms }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Gagal mengirim data diagnosa.');
            }
            const result = await res.json();
            localStorage.setItem('diagnosisResult', JSON.stringify(result));
            router.push('/diagnosa/hasil');
        } catch (err) {
            setError(err.message);
            console.error("Error submitting diagnosis:", err);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out";
    const labelClasses = "block text-gray-700 text-sm font-semibold mb-2";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200">
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Formulir Diagnosa
                    </h1>
                     <p className="mt-2 max-w-2xl mx-auto text-md text-gray-600">
                        Isi data diri dan jawab kuesioner untuk memulai.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Data Diri Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                            <User className="w-6 h-6 mr-3 text-indigo-600" />Data Diri Pasien
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="nama" className={labelClasses}>Nama Lengkap:</label>
                                <input type="text" id="nama" name="nama" value={user.nama} onChange={handleUserChange} className={inputClasses} placeholder="Masukkan nama lengkap" required />
                            </div>
                            <div>
                                <label htmlFor="jenis_kelamin" className={labelClasses}>Jenis Kelamin:</label>
                                <select id="jenis_kelamin" name="jenis_kelamin" value={user.jenis_kelamin} onChange={handleUserChange} className={inputClasses} required>
                                    <option value="">Pilih jenis kelamin</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="usia" className={labelClasses}>Usia (Tahun):</label>
                                <input type="number" id="usia" name="usia" value={user.usia} onChange={handleUserChange} className={inputClasses} placeholder="Masukkan usia" required min="0" />
                            </div>
                            <div>
                                <label htmlFor="alamat" className={labelClasses}>Alamat:</label>
                                <select id="alamat" name="alamat" value={user.alamat} onChange={handleUserChange} className={inputClasses} required>
                                    <option value="">Pilih Alamat</option>
                                    {namaKampung.map((kampung, index) => (
                                        <option key={index} value={kampung}>{kampung}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>
                    
                    {/* Kuesioner Gejala Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                            <ClipboardList className="w-6 h-6 mr-3 text-indigo-600" />Kuesioner Gejala
                        </h2>
                        <p className="text-gray-600 mb-8 text-md">
                            Pilih tingkat keyakinan Anda untuk setiap gejala yang dialami.
                        </p>
                        <div className="space-y-6">
                            {gejalaLoading ? (
                                <div className="flex justify-center items-center h-48 text-gray-500">
                                    <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
                                    <p>Memuat gejala...</p>
                                </div>
                            ) : gejala.length > 0 ? (
                                gejala.map((g, index) => (
                                    <div key={g.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                                        <p className="font-semibold text-gray-800 mb-4 text-md">{index + 1}. {g.gejala}</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-3">
                                            {confidenceLevels.map(level => (
                                                <label key={level.value} className="flex items-center space-x-2 cursor-pointer text-gray-700 text-sm font-medium">
                                                    <input type="radio" name={`gejala_${g.id}`} value={level.value}
                                                        onChange={() => handleGejalaChange(g.id, level.value)}
                                                        checked={selectedGejala[g.id] === level.value}
                                                        className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 transition"
                                                    />
                                                    <span>{level.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 italic py-10">Tidak ada gejala yang tersedia.</p>
                            )}
                        </div>
                    </section>

                    {error && <Alert message={error} type="error" />}

                    <div className="text-center pt-4">
                        <button type="submit" disabled={loading || gejalaLoading} className="inline-flex items-center justify-center px-10 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105">
                            {loading ? (
                                <><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" /> Memproses...</>
                            ) : (
                                <><Send className="-ml-1 mr-3 h-5 w-5" /> Lihat Hasil Diagnosa</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}