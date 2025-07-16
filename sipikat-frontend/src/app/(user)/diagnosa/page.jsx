// src/app/(user)/diagnosa/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ClipboardList, Send, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react'; 

const confidenceLevels = [
    { label: "Tidak", value: 0 }, { label: "Jarang", value: 0.2 },
    { label: "Kadang-kadang", value: 0.4 }, { label: "Sering", value: 0.6 },
    { label: "Sangat Sering", value: 0.8 }, { label: "Selalu", value: 1.0 },
];
const namaKampung = ["Leuwi Kolot", "Tegalwangi", "Cibuntu", "Cilaja", "Ciparay", "Pasirpeuteuy"];

const Alert = ({ message }) => (
    <div className="px-4 py-3 rounded-md relative text-center text-sm font-medium shadow-sm bg-red-50 border border-red-300 text-red-700 flex items-center justify-center space-x-2" role="alert">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p>{message}</p>
    </div>
);

const ProgressIndicator = ({ currentStep }) => {
    const steps = ["Data Diri", "Kuesioner"];
    return (
        <div className="flex items-center w-full max-w-md mx-auto mb-10">
            {steps.map((step, index) => {
                const stepIndex = index + 1;
                const isCompleted = currentStep > stepIndex;
                const isActive = currentStep === stepIndex;
                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-600 text-white scale-110' : isCompleted ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                                {isCompleted ? '✓' : stepIndex}
                            </div>
                            <p className={`mt-2 text-xs text-center font-semibold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 transition-colors duration-300 mx-2 ${currentStep > stepIndex ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default function DiagnosaPage() {
    const [step, setStep] = useState(1);
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
            } finally {
                setGejalaLoading(false);
            }
        };
        fetchGejala();
    }, []);

    const handleUserChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
    const handleGejalaChange = (gejalaId, cf_user) => setSelectedGejala(prev => ({ ...prev, [gejalaId]: cf_user }));

    const nextStep = () => {
        if (step === 1) {
            if (!user.nama || !user.usia || !user.alamat || !user.jenis_kelamin) {
                setError('Harap lengkapi semua field Data Diri.');
                return;
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setError('');
        setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        } finally {
            setLoading(false);
        }
    };

    // --- STYLING CLASSES ---
    const inputClasses = "block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out";
    const labelClasses = "block text-gray-700 text-sm font-semibold mb-2";

    // --- ANIMATION VARIANTS ---
    const formVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Formulir Diagnosa
                    </h1>
                     <p className="mt-2 max-w-2xl mx-auto text-md text-gray-600">
                        Ikuti langkah-langkah berikut untuk mendapatkan hasil diagnosa.
                    </p>
                </div>
                
                <ProgressIndicator currentStep={step} />

                <form onSubmit={handleSubmit} className="mt-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.section key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                                    <User className="w-6 h-6 mr-3 text-blue-600" />Langkah 1: Data Diri Pasien
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="nama" className={labelClasses}>Nama Lengkap:</label>
                                        <input type="text" id="nama" name="nama" value={user.nama} onChange={handleUserChange} className={inputClasses} placeholder="Masukkan nama lengkap"/>
                                    </div>
                                    <div>
                                        <label htmlFor="jenis_kelamin" className={labelClasses}>Jenis Kelamin:</label>
                                        <select id="jenis_kelamin" name="jenis_kelamin" value={user.jenis_kelamin} onChange={handleUserChange} className={inputClasses}>
                                            <option value="">Pilih jenis kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="usia" className={labelClasses}>Usia (Tahun):</label>
                                        <input type="number" id="usia" name="usia" value={user.usia} onChange={handleUserChange} className={inputClasses} placeholder="Masukkan usia" min="0" />
                                    </div>
                                    <div>
                                        <label htmlFor="alamat" className={labelClasses}>Alamat:</label>
                                        <select id="alamat" name="alamat" value={user.alamat} onChange={handleUserChange} className={inputClasses}>
                                            <option value="">Pilih Alamat</option>
                                            {namaKampung.map((kampung, index) => (
                                                <option key={index} value={kampung}>{kampung}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {step === 2 && (
                            <motion.section key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                                    <ClipboardList className="w-6 h-6 mr-3 text-blue-600" />Langkah 2: Kuesioner Gejala
                                </h2>
                                <p className="text-gray-600 mb-8 text-md">Pilih tingkat keyakinan Anda untuk setiap gejala yang dialami.</p>
                                <div className="space-y-6">
                                    {gejalaLoading ? (
                                        <div className="flex justify-center items-center h-48 text-gray-500">
                                            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mr-3" />
                                            <p>Memuat gejala...</p>
                                        </div>
                                    ) : gejala.length > 0 ? (
                                        gejala.map((g, index) => (
                                            <div key={g.id} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                                                <p className="font-semibold text-gray-800 mb-4 text-md">{index + 1}. {g.gejala}</p>
                                                <fieldset className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                                    {confidenceLevels.map(level => (
                                                        <label key={level.value} className="relative flex items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:shadow-inner text-center">
                                                            <input type="radio" name={`gejala_${g.id}`} value={level.value}
                                                                onChange={() => handleGejalaChange(g.id, level.value)}
                                                                checked={selectedGejala[g.id] === level.value}
                                                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                                            />
                                                            <span className="text-gray-700 text-sm font-medium">{level.label}</span>
                                                        </label>
                                                    ))}
                                                </fieldset>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 italic py-10">Tidak ada gejala yang tersedia.</p>
                                    )}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {error && <div className="mt-8"><Alert message={error} /></div>}

                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
                        <div>
                            {step > 1 && (
                                <button type="button" onClick={prevStep} className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
                                    Kembali
                                </button>
                            )}
                        </div>
                        <div className="flex-grow flex justify-end">
                            {step === 1 && (
                                <button type="button" onClick={nextStep} className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
                                    Lanjut ke Kuesioner
                                </button>
                            )}
                            {step === 2 && (
                                <button type="submit" disabled={loading || gejalaLoading} className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
                                    {loading ? (
                                        <><Loader2 className="animate-spin mr-3 h-5 w-5" /> Memproses...</>
                                    ) : (
                                        "Diagnosa"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}