import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default async function PrivacyPolicyPage() {
    return (
        <div className="bg-slate-50 font-sans text-slate-800">
            {/* --- Header --- */}
            <header className="bg-gradient-to-br from-gray-900 to-slate-800 text-white text-center py-20 shadow-lg">
                <div className="container mx-auto px-6">
                    <ShieldCheck className="w-20 h-20 mx-auto mb-5 text-teal-400" strokeWidth={1.5} />
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Kebijakan Privasi
                    </h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                        Komitmen kami untuk melindungi data dan privasi Anda di SIPIKAT.
                    </p>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-6">
                    <div className="prose lg:prose-lg max-w-none bg-white p-8 md:p-12 rounded-xl shadow-md">
                        <p className="lead text-lg text-slate-600">
                            SIPIKAT menghargai privasi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi pengguna saat menggunakan aplikasi SIPIKAT (Sistem Pakar Identifikasi Kecanduan Gadget).
                        </p>
                        
                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            1. Informasi yang Kami Kumpulkan
                        </h3>
                        <p>
                            Aplikasi SIPIKAT dapat mengumpulkan data berikut untuk memberikan layanan yang optimal:
                        </p>
                        <ul className="space-y-3 mt-4">
                            <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Data Pribadi:</strong> Nama, usia, jenis kelamin (jika Anda memberikannya secara sukarela).</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Data Penggunaan:</strong> Hasil penilaian atau konsultasi yang Anda lakukan di dalam aplikasi untuk melacak kemajuan.</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Informasi Perangkat:</strong> Jenis perangkat, sistem operasi, dan versi aplikasi untuk memastikan kompatibilitas dan perbaikan bug.</span>
                            </li>
                        </ul>
                        <p className="mt-4 text-sm text-slate-500 italic">
                            Kami tidak mengumpulkan informasi pribadi sensitif seperti alamat rumah, nomor telepon, atau data keuangan.
                        </p>

                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            2. Penggunaan Informasi
                        </h3>
                        <p>
                            Informasi yang kami kumpulkan digunakan secara khusus untuk:
                        </p>
                        <ul className="space-y-3 mt-4">
                             <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Memberikan hasil analisis atau konsultasi yang akurat sesuai dengan fitur SIPIKAT.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Meningkatkan kualitas, fitur, dan kinerja aplikasi secara berkelanjutan.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Melakukan analisis statistik internal secara anonim tanpa mengidentifikasi pengguna secara pribadi.</span>
                            </li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            3. Penyimpanan dan Keamanan Data
                        </h3>
                        <p>
                           Data Anda disimpan dengan aman, baik secara lokal di perangkat Anda maupun di server kami (jika fitur online tersedia). Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang sesuai untuk melindungi data Anda dari akses, pengubahan, atau penghapusan yang tidak sah.
                        </p>
                        
                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            4. Berbagi Informasi
                        </h3>
                        <p>
                           Kami berkomitmen untuk tidak membagikan, menjual, atau menyewakan data pribadi Anda kepada pihak ketiga mana pun, kecuali dalam kondisi berikut:
                        </p>
                        <ul className="space-y-3 mt-4">
                             <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Atas persetujuan eksplisit dari Anda.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Jika diwajibkan oleh hukum yang berlaku atau melalui perintah pengadilan yang sah.</span>
                            </li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            5. Hak Anda sebagai Pengguna
                        </h3>
                         <p>
                           Anda memiliki kendali penuh atas data Anda. Anda berhak untuk:
                        </p>
                        <ul className="space-y-3 mt-4">
                             <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Mengakses, memperbarui, atau meminta penghapusan data pribadi Anda.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Menolak penggunaan data untuk kepentingan statistik (jika relevan).</span>
                            </li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            6. Perubahan Kebijakan Privasi
                        </h3>
                        <p>
                            Kebijakan ini dapat kami perbarui dari waktu ke waktu untuk menyesuaikan dengan perubahan layanan atau peraturan. Setiap perubahan signifikan akan kami informasikan melalui pembaruan aplikasi atau notifikasi lain yang relevan.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}