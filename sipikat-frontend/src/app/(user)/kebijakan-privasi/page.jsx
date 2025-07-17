import { ShieldCheck, Info, Database, Share2, UserCheck, RefreshCw } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white font-sans text-gray-800">
            <header className="bg-gray-800 text-white text-center py-20">
                <div className="container mx-auto px-6">
                    <ShieldCheck className="w-20 h-20 mx-auto mb-4 text-blue-400" />
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Kebijakan Privasi SIPIKAT
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
                        Kami berkomitmen penuh untuk melindungi data dan menjaga privasi Anda. Kepercayaan Anda adalah prioritas utama kami.
                    </p>
                </div>
            </header>

            <main className="py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl space-y-12">

                    <div className="text-center">
                        <p>
                            Selamat datang di SIPIKAT (Sistem Pakar Identifikasi Kecanduan Gadget). Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
                        </p>
                         <p className="mt-2 text-sm text-gray-500">Terakhir diperbarui: 16 Juli 2025</p>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center mb-4">
                            <Info className="w-8 h-8 mr-4 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">1. Informasi yang Kami Kumpulkan</h2>
                        </div>
                        <p className="mb-4">Aplikasi SIPIKAT dapat mengumpulkan beberapa jenis data untuk fungsionalitas aplikasi:</p>
                        <ul className="space-y-3 list-disc list-inside text-gray-700">
                            <li><strong>Data Pribadi:</strong> Nama, usia, dan jenis kelamin (diberikan secara sukarela oleh Anda).</li>
                            <li><strong>Data Penggunaan:</strong> Hasil dan riwayat dari penilaian atau konsultasi yang Anda lakukan.</li>
                            <li><strong>Informasi Perangkat:</strong> Jenis perangkat, versi sistem operasi, dan versi aplikasi untuk memastikan kompatibilitas dan analisis eror.</li>
                        </ul>
                        <p className="mt-4 text-sm bg-blue-100 text-blue-800 p-3 rounded-lg">
                            Kami <strong>tidak</strong> mengumpulkan data pribadi sensitif seperti alamat rumah, nomor telepon, atau informasi finansial.
                        </p>
                    </div>
                    
                    <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center mb-4">
                            <ShieldCheck className="w-8 h-8 mr-4 text-green-600" />
                            <h2 className="text-2xl font-bold text-gray-900">2. Penggunaan Informasi Anda</h2>
                        </div>
                        <p className="mb-4">Data yang terkumpul kami manfaatkan untuk tujuan berikut:</p>
                        <ul className="space-y-3 list-disc list-inside text-gray-700">
                            <li>Menyediakan hasil analisis dan konsultasi yang akurat sesuai fitur SIPIKAT.</li>
                            <li>Melakukan analisis statistik internal secara anonim untuk meningkatkan kualitas dan performa aplikasi.</li>
                            <li>Memperbaiki dan mengembangkan fitur baru berdasarkan tren penggunaan.</li>
                        </ul>
                    </div>

                     <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center mb-4">
                            <Database className="w-8 h-8 mr-4 text-yellow-600" />
                            <h2 className="text-2xl font-bold text-gray-900">3. Penyimpanan dan Keamanan Data</h2>
                        </div>
                        <ul className="space-y-3 list-disc list-inside text-gray-700">
                           <li>Data Anda disimpan secara aman di perangkat Anda (lokal) atau di server kami jika fitur online digunakan.</li>
                           <li>Kami menerapkan langkah-langkah keamanan standar industri untuk melindungi data Anda dari akses, perubahan, atau penghapusan yang tidak sah.</li>
                        </ul>
                    </div>

                     <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center mb-4">
                            <Share2 className="w-8 h-8 mr-4 text-red-600" />
                            <h2 className="text-2xl font-bold text-gray-900">4. Berbagi Informasi</h2>
                        </div>
                        <p>Kami tidak akan pernah menjual atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan komersial. Pengecualian berlaku jika:</p>
                        <ul className="space-y-3 list-disc list-inside text-gray-700 mt-3">
                            <li>Anda memberikan izin secara eksplisit untuk melakukannya.</li>
                            <li>Diwajibkan oleh hukum yang berlaku atau melalui perintah pengadilan yang sah.</li>
                        </ul>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center mb-4">
                            <UserCheck className="w-8 h-8 mr-4 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">5. Hak Anda sebagai Pengguna</h2>
                        </div>
                        <p>Anda memiliki kontrol penuh atas data Anda dan berhak untuk:</p>
                        <ul className="space-y-3 list-disc list-inside text-gray-700 mt-3">
                            <li>Mengakses, memperbarui, atau meminta penghapusan data pribadi Anda.</li>
                            <li>Menolak penggunaan data untuk kepentingan statistik (jika opsi ini tersedia).</li>
                        </ul>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center mb-4">
                            <RefreshCw className="w-8 h-8 mr-4 text-teal-600" />
                            <h2 className="text-2xl font-bold text-gray-900">6. Perubahan Kebijakan Privasi</h2>
                        </div>
                        <p>Kebijakan ini dapat kami perbarui dari waktu ke waktu seiring dengan perkembangan aplikasi. Setiap perubahan signifikan akan kami informasikan melalui notifikasi di dalam aplikasi atau melalui pembaruan di toko aplikasi.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}