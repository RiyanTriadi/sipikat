'use client';

import { useEffect, useState } from 'react';
import { User, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const confidenceLevels = [
    { label: 'Tidak Pernah', value: 0 },
    { label: 'Kadang-kadang', value: 0.33 },
    { label: 'Sering', value: 0.67 },
    { label: 'Selalu', value: 1.0 },
];

const Alert = ({ message }) => (
    <div className="relative flex items-center justify-center space-x-2 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 shadow-sm" role="alert">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p>{message}</p>
    </div>
);

const ProgressIndicator = ({ currentStep }) => {
    const steps = ['Data Diri', 'Kuesioner'];

    return (
        <div className="mx-auto mb-10 flex w-full max-w-md items-center">
            {steps.map((step, index) => {
                const stepIndex = index + 1;
                const isCompleted = currentStep > stepIndex;
                const isActive = currentStep === stepIndex;

                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'scale-110 bg-blue-600 text-white' : isCompleted ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-500'}`}
                            >
                                {isCompleted ? '✓' : stepIndex}
                            </div>
                            <p className={`mt-2 text-center text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`mx-2 h-1 flex-1 transition-colors duration-300 ${currentStep > stepIndex ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default function DiagnosaForm() {
    const [step, setStep] = useState(1);
    const [user, setUser] = useState({ nama: '', jenis_kelamin: '', usia: '', alamat: '' });
    const [gejala, setGejala] = useState([]);
    const [selectedGejala, setSelectedGejala] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [gejalaLoading, setGejalaLoading] = useState(true);

    useEffect(() => {
        const fetchGejala = async () => {
            setGejalaLoading(true);

            try {
                const res = await fetch(`${API_BASE_URL}/api/gejala`);
                if (!res.ok) {
                    throw new Error('Gagal mengambil data gejala dari server.');
                }

                const data = await res.json();
                setGejala(data);

                const initialSelected = {};
                data.forEach((item) => {
                    initialSelected[item.id] = 0;
                });
                setSelectedGejala(initialSelected);
            } catch (err) {
                setError(err.message);
            } finally {
                setGejalaLoading(false);
            }
        };

        fetchGejala();
    }, []);

    const handleUserChange = (event) => {
        setUser((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleGejalaChange = (gejalaId, cfUser) => {
        setSelectedGejala((prev) => ({ ...prev, [gejalaId]: cfUser }));
    };

    const nextStep = () => {
        if (step === 1 && (!user.nama || !user.usia || !user.alamat || !user.jenis_kelamin)) {
            setError('Harap lengkapi semua field Data Diri.');
            return;
        }

        if (step === 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        setError('');
        setStep((currentStep) => currentStep + 1);
    };

    const prevStep = () => setStep((currentStep) => currentStep - 1);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const selectedSymptoms = Object.entries(selectedGejala)
            .filter(([, cfUser]) => cfUser > 0)
            .map(([id, cfUser]) => ({ id, cf_user: Number.parseFloat(cfUser) }));

        if (selectedSymptoms.length === 0) {
            setError('Harap pilih minimal satu gejala dengan tingkat keyakinan selain "Tidak Pernah".');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/diagnosa`, {
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
            window.location.assign('/diagnosa/hasil');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = 'block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm transition duration-150 ease-in-out placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
    const labelClasses = 'mb-2 block text-sm font-semibold text-gray-700';

    const formVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
    };

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl rounded-2xl border border-gray-200/80 bg-white p-8 shadow-2xl sm:p-10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Formulir Diagnosa</h1>
                    <p className="mx-auto mt-2 max-w-2xl text-md text-gray-600">Ikuti langkah-langkah berikut untuk mendapatkan hasil diagnosa.</p>
                </div>

                <ProgressIndicator currentStep={step} />

                <form onSubmit={handleSubmit} method="post" noValidate className="mt-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.section key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                                <h2 className="mb-6 flex items-center border-b border-gray-200 pb-3 text-2xl font-bold text-gray-800">
                                    <User className="mr-3 h-6 w-6 text-blue-600" />
                                    Langkah 1: Data Diri Pasien
                                </h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="nama" className={labelClasses}>Nama Lengkap:</label>
                                        <input type="text" id="nama" name="nama" value={user.nama} onChange={handleUserChange} className={inputClasses} placeholder="Masukkan nama lengkap" autoComplete="name" />
                                    </div>
                                    <div>
                                        <label htmlFor="jenis_kelamin" className={labelClasses}>Jenis Kelamin:</label>
                                        <select id="jenis_kelamin" name="jenis_kelamin" value={user.jenis_kelamin} onChange={handleUserChange} className={inputClasses} autoComplete="sex">
                                            <option value="">Pilih jenis kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="usia" className={labelClasses}>Usia (Tahun):</label>
                                        <input type="number" id="usia" name="usia" value={user.usia} onChange={handleUserChange} className={inputClasses} placeholder="Masukkan usia" min="0" inputMode="numeric" />
                                    </div>
                                    <div>
                                        <label htmlFor="alamat" className={labelClasses}>Alamat:</label>
                                        <input type="text" id="alamat" name="alamat" value={user.alamat} onChange={handleUserChange} className={inputClasses} placeholder="Masukkan alamat lengkap" autoComplete="street-address" />
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {step === 2 && (
                            <motion.section key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                                <h2 className="mb-6 flex items-center border-b border-gray-200 pb-3 text-2xl font-bold text-gray-800">
                                    <ClipboardList className="mr-3 h-6 w-6 text-blue-600" />
                                    Langkah 2: Kuesioner Gejala
                                </h2>
                                <p className="mb-8 text-md text-gray-600">Pilih tingkat keyakinan Anda untuk setiap gejala yang dialami.</p>
                                <div className="space-y-6">
                                    {gejalaLoading ? (
                                        <div className="flex h-48 items-center justify-center text-gray-500">
                                            <Loader2 className="mr-3 h-8 w-8 animate-spin text-blue-600" />
                                            <p>Memuat gejala...</p>
                                        </div>
                                    ) : gejala.length > 0 ? (
                                        gejala.map((item, index) => (
                                            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                                <p className="mb-4 text-md font-semibold text-gray-800">{index + 1}. {item.gejala}</p>
                                                <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                    {confidenceLevels.map((level) => (
                                                        <label key={level.value} className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 p-2 text-center transition-all duration-200 ease-in-out has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:shadow-inner">
                                                            <input
                                                                type="radio"
                                                                name={`gejala_${item.id}`}
                                                                value={level.value}
                                                                onChange={() => handleGejalaChange(item.id, level.value)}
                                                                checked={selectedGejala[item.id] === level.value}
                                                                className="absolute h-full w-full cursor-pointer opacity-0"
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">{level.label}</span>
                                                        </label>
                                                    ))}
                                                </fieldset>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-10 text-center italic text-gray-500">Tidak ada gejala yang tersedia.</p>
                                    )}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {error && <div className="mt-8"><Alert message={error} /></div>}

                    <div className="mt-12 flex flex-col items-center gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:justify-between">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-all hover:scale-[1.02] hover:bg-gray-50 sm:w-auto"
                            >
                                Kembali
                            </button>
                        )}
                        <div className="flex w-full flex-grow justify-end sm:w-auto">
                            {step === 1 && (
                                <button type="button" onClick={nextStep} className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all hover:scale-105 hover:bg-blue-700 sm:w-auto">
                                    Lanjut ke Kuesioner
                                </button>
                            )}
                            {step === 2 && (
                                <button type="submit" disabled={loading || gejalaLoading} className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all hover:scale-105 hover:bg-blue-700 disabled:bg-blue-300 sm:w-auto">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Lihat Hasil Diagnosa'
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
