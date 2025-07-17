import Link from 'next/link';
import { FileText, BookText, Target, CheckCircle, ShieldAlert, Copyright, Settings, LockKeyhole, UserX, Ban } from 'lucide-react';

export default function TermsAndConditionsPage() {
    return (
        <div className="bg-white font-sans text-gray-800">
            <header className="bg-gray-800 text-white text-center py-20">
                <div className="container mx-auto px-6">
                    <FileText className="w-20 h-20 mx-auto mb-4 text-blue-400" />
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Syarat dan Ketentuan
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
                        Aturan dan pedoman penggunaan aplikasi SIPIKAT.
                    </p>
                </div>
            </header>

            <main className="py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl space-y-12">

                    <div className="text-center">
                        <p className="text-lg">
                            Harap membaca syarat dan ketentuan ini dengan seksama sebelum menggunakan aplikasi SIPIKAT. Dengan mengakses atau menggunakan aplikasi ini, Anda dianggap telah membaca, memahami, dan menyetujui seluruh isi dalam syarat dan ketentuan ini.
                        </p>
                         <p className="mt-2 text-sm text-gray-500">Terakhir diperbarui: 16 Juli 2025</p>
                    </div>

                    <SectionWrapper icon={<BookText className="text-blue-600" />} title="1. Definisi">
                        <ul className="space-y-3 list-disc list-inside text-gray-700">
                            <li><strong>Aplikasi:</strong> Merujuk pada aplikasi mobile SIPIKAT.</li>
                            <li><strong>Pengguna:</strong> Setiap individu yang mengakses dan menggunakan layanan dalam aplikasi.</li>
                            <li><strong>Developer:</strong> Pihak pengembang dan pengelola aplikasi SIPIKAT.</li>
                        </ul>
                    </SectionWrapper>
                    
                    <SectionWrapper icon={<Target className="text-green-600" />} title="2. Tujuan Aplikasi">
                        <p className="mb-3">SIPIKAT adalah aplikasi sistem pakar yang bertujuan untuk membantu pengguna mengidentifikasi tingkat kemungkinan kecanduan gadget berdasarkan input yang diberikan oleh pengguna melalui kuisioner atau interaksi tertentu.</p>
                        <p className="mt-4 text-sm bg-yellow-100 text-yellow-800 p-3 rounded-lg border border-yellow-200">
                           <strong>Penting:</strong> Aplikasi ini bukan alat diagnosis medis resmi dan tidak dapat menggantikan konsultasi dengan profesional kesehatan mental atau medis.
                        </p>
                    </SectionWrapper>

                     <SectionWrapper icon={<CheckCircle className="text-cyan-600" />} title="3. Penggunaan yang Diperbolehkan">
                        <p className="mb-3">Pengguna diperbolehkan untuk:</p>
                        <ul className="space-y-3 list-disc list-inside text-gray-700">
                           <li>Menggunakan aplikasi untuk keperluan pribadi dan non-komersial.</li>
                           <li>Melakukan penilaian mandiri menggunakan fitur yang telah tersedia.</li>
                           <li>Membaca hasil penilaian yang diberikan sebagai referensi dan wawasan pribadi.</li>
                        </ul>
                    </SectionWrapper>

                     <SectionWrapper icon={<ShieldAlert className="text-red-600" />} title="4. Batasan Tanggung Jawab">
                        <p className="mb-3">Developer tidak bertanggung jawab atas segala bentuk kerugian atau kerusakan yang timbul akibat penggunaan informasi dari aplikasi ini.</p>
                        <p>Hasil analisis yang disajikan bersifat indikatif dan tidak dapat dijadikan dasar tunggal untuk diagnosis atau rencana terapi medis.</p>
                    </SectionWrapper>
                    
                    <SectionWrapper icon={<Copyright className="text-purple-600" />} title="5. Hak Kekayaan Intelektual">
                        <p className="mb-3">Seluruh konten, fitur, kode sumber, dan desain aplikasi SIPIKAT adalah milik mutlak developer.</p>
                        <p>Dilarang keras menggandakan, menyebarluaskan, merekayasa balik, atau memodifikasi bagian mana pun dari aplikasi ini tanpa izin tertulis dari pihak developer.</p>
                    </SectionWrapper>

                    <SectionWrapper icon={<Settings className="text-gray-600" />} title="6. Perubahan Layanan">
                        <p>Developer berhak untuk mengubah, menambah, atau menghapus fitur aplikasi tanpa pemberitahuan terlebih dahulu demi peningkatan kualitas dan fungsionalitas layanan.</p>
                    </SectionWrapper>
                    
                    <SectionWrapper icon={<LockKeyhole className="text-blue-600" />} title="7. Privasi Pengguna">
                        <p>Setiap data yang Anda masukkan akan dikelola dengan kerahasiaan penuh sesuai dengan <Link href="/privasi" className="text-blue-600 hover:underline font-medium">Kebijakan Privasi</Link> kami.</p>
                    </SectionWrapper>
                    
                    <SectionWrapper icon={<Ban className="text-red-600" />} title="8. Penyalahgunaan Aplikasi">
                        <p className="mb-3">Pengguna dilarang keras menggunakan aplikasi ini untuk:</p>
                        <ul className="space-y-3 list-disc list-inside text-gray-700">
                           <li>Tujuan yang melanggar hukum atau norma yang berlaku.</li>
                           <li>Menyebarkan informasi yang tidak benar, menyesatkan, atau merugikan pihak lain.</li>
                           <li>Melakukan upaya modifikasi, peretasan, atau tindakan yang mengganggu sistem aplikasi.</li>
                        </ul>
                    </SectionWrapper>

                    <SectionWrapper icon={<UserX className="text-orange-600" />} title="9. Pengakhiran Akses">
                        <p>Developer berhak membatasi atau menghentikan akses pengguna secara sepihak jika terdapat indikasi kuat adanya pelanggaran terhadap syarat dan ketentuan ini.</p>
                    </SectionWrapper>

                </div>
            </main>
        </div>
    );
}

const SectionWrapper = ({ icon, title, children }) => {
    return (
        <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center mb-4">
                <div className="mr-4 w-8 h-8 flex-shrink-0">{icon}</div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="pl-12">
                {children}
            </div>
        </div>
    );
};