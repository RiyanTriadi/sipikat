import { BrainCircuit, Github, Instagram, Linkedin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const getTechIcon = (techName, size = 24) => {
    const fileName = techName.toLowerCase().replace(/\s+/g, '-');
    const imagePath = `/icons/tech/${fileName}.svg`;

    return (
        <Image
            src={imagePath}
            alt={`${techName} logo`}
            width={size}
            height={size}
            className="transition-transform hover:scale-110"
        />
    );
};

const TechStackIcons = ({ technologies }) => (
    <div className="flex flex-wrap justify-center gap-4 mt-2 mb-4">
        {technologies.map((tech, index) => (
            <div key={index} title={tech}>
                {getTechIcon(tech, 24)}
            </div>
        ))}
    </div>
);

export default function TentangPage() {
    const dadiTechStack = [
        'HTML5',
        'CSS3',
        'JavaScript',
        'Php',
        'Laravel',
        'Flutter',
        'TailwindCSS',
        'MySQL',
    ];

    const riyanTechStack = [
        'HTML5',
        'CSS3',
        'JavaScript',
        'ExpressJS',
        'ReactJS',
        'NextJS',
        'TailwindCSS',
        'MySQL',
    ];

    return (
        <div className="bg-gray-50 font-sans">
            <section
                className="relative bg-cover bg-center py-16 text-center text-white"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1495653797063-114787b77b23?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 mx-auto max-w-4xl px-6">
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl pb-5">
                        Tentang SIPIKAT
                    </h1>
                    <p className="mt-4 text-lg text-gray-50 md:text-xl">
                        SIPAKAT (Sistem Pakar Identifikasi Kecanduan Gadget) adalah platform yang dirancang untuk membantu Anda mengidentifikasi tingkat kemungkinan kecanduan gadget melalui kuesioner berbasis metode Certainty Factor. Aplikasi ini menyediakan hasil persentase dan solusi yang relevan sebagai alat bantu edukasi untuk meningkatkan kesadaran akan kebiasaan digital Anda. Penting untuk diingat bahwa hasil dari SIPAKAT bersifat indikatif dan bukan merupakan diagnosis medis profesional, sehingga tidak dapat menggantikan konsultasi dengan ahli kesehatan.
                    </p>
                </div>
            </section>

            <main className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="space-y-20">
                    <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
                        <div className="mb-12 text-center">
                            <BrainCircuit className="mx-auto mb-4 h-20 w-20 text-blue-600" />
                            <h2 className="text-3xl font-bold text-gray-900">
                                Bagaimana Cara Kerjanya?
                            </h2>
                            <p className="mx-auto mt-2 max-w-3xl text-lg text-gray-600">
                                Aplikasi ini menggunakan metode Sistem Pakar Certainty Factor untuk memberikan hasil yang akurat, meniru cara seorang ahli dalam membuat diagnosa.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                            <div className="flex flex-col items-center p-4">
                                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">1</span>
                                <h3 className="mb-2 text-xl font-semibold">Isi Kuesioner</h3>
                                <p className="text-gray-600">
                                    Anda menjawab serangkaian pertanyaan yang dirancang untuk mengidentifikasi gejala umum kecanduan gadget.
                                </p>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">2</span>
                                <h3 className="mb-2 text-xl font-semibold">Analisis Sistem</h3>
                                <p className="text-gray-600">
                                    Setiap jawaban dianalisis menggunakan metode Certainty Factor (CF) yang menggabungkan keyakinan Anda dengan bobot keahlian dalam sistem.
                                </p>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">3</span>
                                <h3 className="mb-2 text-xl font-semibold">Hasil & Solusi</h3>
                                <p className="text-gray-600">
                                    Sistem memberikan hasil tingkat kecanduan beserta persentase keyakinan, dan rekomendasi solusi yang dipersonalisasi.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold text-gray-900">
                                Tim Developer SIPIKAT
                            </h2>
                        </div>
                        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2">
                            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                                <h3 className="text-2xl font-bold text-gray-900">Riyan Triadi</h3>
                                <p className="mb-3 font-semibold text-blue-600">Developer Web SIPIKAT</p>
                                <p className="mb-4 flex-grow text-gray-600">
                                    Mahasiswa Sistem Informasi dengan ketertarikan pada frontend development menggunakan JavaScript.
                                </p>
                                <TechStackIcons technologies={riyanTechStack} />
                                <div className="mt-auto flex space-x-4">
                                    <Link href="https://github.com/RiyanTriadi" className="text-gray-500 transition-colors hover:text-gray-900">
                                        <Github className="h-6 w-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-500 transition-colors hover:text-blue-700">
                                        <Linkedin className="h-6 w-6" />
                                    </Link>
                                    <Link href="https://www.instagram.com/ryn3d/" className="text-gray-500 transition-colors hover:text-pink-600">
                                        <Instagram className="h-6 w-6" />
                                    </Link>
                                </div>
                            </div>
                            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                                <h3 className="text-2xl font-bold text-gray-900">Dadi Suhendi</h3>
                                <p className="mb-3 font-semibold text-blue-600">Developer SIPIKAT Mobile</p>
                                <p className="mb-4 flex-grow text-gray-600">
                                    Memiliki hasrat dalam merancang antarmuka yang intuitif. Percaya bahwa desain yang baik adalah kunci dari teknologi yang bermanfaat.
                                </p>
                                <TechStackIcons technologies={dadiTechStack} />
                                <div className="mt-auto flex space-x-4">
                                    <Link href="https://github.com/DadiSuhendi" className="text-gray-500 transition-colors hover:text-gray-900">
                                        <Github className="h-6 w-6" />
                                    </Link>
                                    <Link href="https://www.linkedin.com/in/dadi-suhendi-50963a234/" className="text-gray-500 transition-colors hover:text-blue-700">
                                        <Linkedin className="h-6 w-6" />
                                    </Link>
                                    <Link href="https://www.instagram.com/dadisuhendi_09/" className="text-gray-500 transition-colors hover:text-pink-600">
                                        <Instagram className="h-6 w-6" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}