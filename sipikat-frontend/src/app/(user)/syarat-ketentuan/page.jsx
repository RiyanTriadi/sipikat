import { FileText, Gavel } from 'lucide-react';

export default async function TermsAndConditionsPage() {

    return (
        <div className="bg-slate-50 font-sans text-slate-800">
            <header className="bg-gradient-to-br from-gray-900 to-slate-800 text-white text-center py-20 shadow-lg">
                <div className="container mx-auto px-6">
                    <FileText className="w-20 h-20 mx-auto mb-5 text-teal-400" strokeWidth={1.5} />
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Syarat dan Ketentuan
                    </h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                        Aturan dan pedoman penggunaan layanan platform SIPIKAT.
                    </p>
                </div>
            </header>

            <main className="py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-6">
                    <div className="prose lg:prose-lg max-w-none bg-white p-8 md:p-12 rounded-xl shadow-md">
                        <p className="lead text-lg text-slate-600">
                            Harap membaca syarat dan ketentuan ini dengan seksama sebelum menggunakan aplikasi SIPIKAT. Dengan mengakses atau menggunakan aplikasi ini, Anda dianggap telah membaca, memahami, dan menyetujui seluruh isi dalam syarat dan ketentuan ini.
                        </p>
                        
                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            1. Definisi
                        </h3>
                        <ul className="space-y-3 mt-4 list-none !pl-0">
                            <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Aplikasi:</strong> Merujuk pada aplikasi web dan mobile SIPIKAT.</span>
                            </li>
                            <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Pengguna:</strong> Adalah setiap individu yang mengakses dan menggunakan layanan dalam aplikasi.</span>
                            </li>
                            <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Developer:</strong> Adalah pihak pengembang dan pengelola aplikasi SIPIKAT.</span>
                            </li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            2. Tujuan Aplikasi
                        </h3>
                        <p>
                            SIPIKAT adalah aplikasi sistem pakar yang bertujuan untuk membantu pengguna mengidentifikasi tingkat kemungkinan kecanduan gadget berdasarkan input yang diberikan.
                        </p>
                        <p className="mt-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md">
                            <strong>Penting:</strong> Aplikasi ini bukan alat diagnosis medis resmi dan tidak dapat menggantikan konsultasi dengan profesional kesehatan mental atau medis.
                        </p>
                        
                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            3. Penggunaan yang Diperbolehkan
                        </h3>
                        <p>
                            Pengguna diperbolehkan untuk:
                        </p>
                         <ul className="space-y-3 mt-4 list-none !pl-0">
                            <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Menggunakan aplikasi untuk keperluan pribadi dan non-komersial.</span>
                            </li>
                            <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Melakukan penilaian mandiri menggunakan fitur yang tersedia.</span>
                            </li>
                            <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Melihat hasil penilaian sebagai referensi dan wawasan pribadi.</span>
                            </li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                           4. Batasan Tanggung Jawab
                        </h3>
                        <p>
                           Developer tidak bertanggung jawab atas segala bentuk kerugian atau kerusakan yang timbul akibat penggunaan informasi dari aplikasi ini. Semua keputusan dan tindakan yang diambil berdasarkan hasil aplikasi adalah tanggung jawab penuh pengguna.
                        </p>

                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                           5. Hak Kekayaan Intelektual
                        </h3>
                        <p>
                            Seluruh konten, kode sumber, fitur, dan desain aplikasi SIPIKAT adalah milik eksklusif developer. Dilarang keras menggandakan, mendistribusikan, atau memodifikasi bagian mana pun dari aplikasi ini tanpa izin tertulis dari developer.
                        </p>
                        
                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                            6. Penyalahgunaan Aplikasi
                        </h3>
                        <p>
                            Pengguna dilarang keras menggunakan aplikasi ini untuk:
                        </p>
                         <ul className="space-y-3 mt-4 list-none !pl-0">
                            <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Tujuan yang melanggar hukum atau ilegal.</span>
                            </li>
                            <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Menyebarkan informasi yang tidak benar, menyesatkan, atau merugikan pihak lain.</span>
                            </li>
                             <li className="flex items-start">
                                <Gavel className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Melakukan upaya rekayasa balik (reverse engineering), dekompilasi, atau peretasan sistem.</span>
                            </li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-10 mb-4 border-b pb-2">
                           7. Pengakhiran Akses
                        </h3>
                        <p>
                            Developer berhak, atas kebijakannya sendiri, untuk membatasi atau menghentikan akses pengguna ke aplikasi jika terbukti ada indikasi pelanggaran serius terhadap syarat dan ketentuan ini, tanpa pemberitahuan sebelumnya.
                        </p>

                    </div>
                </div>
            </main>
        </div>
    );
} 