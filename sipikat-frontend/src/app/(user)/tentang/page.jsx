import { BrainCircuit, HeartHandshake, Github, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
        <div className="bg-white font-sans">
            <section className="relative text-white text-center py-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1495653797063-114787b77b23?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10 container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Tentang SIPIKAT</h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
                        Memahami lebih dalam bagaimana sistem pakar kami membantu Anda mengenali dan mengatasi kecanduan gadget.
                    </p>
                </div>
            </section>
/
            <main className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
                    <section className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                                <HeartHandshake className="w-16 h-16 text-blue-600 mb-4" />
                                <h2 className="text-3xl font-bold text-gray-900">Tentang Kami</h2>
                                <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                                    SIPIKAT hadir untuk meningkatkan kesadaran tentang dampak penggunaan gadget dan menyediakan alat yang mudah diakses bagi siapa saja untuk mengevaluasi kebiasaan digital mereka. Kami percaya langkah pertama menuju perubahan adalah pemahaman yang akurat dan personal.
                                </p>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Tim yang berkolaborasi"
                                className="rounded-xl shadow-lg w-full h-auto"
                            />
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200">
                        <div className="text-center mb-12">
                            <BrainCircuit className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-gray-900">Bagaimana Cara Kerjanya?</h2>
                            <p className="mt-2 text-lg text-gray-600 max-w-3xl mx-auto">
                                Aplikasi ini menggunakan metode Sistem Pakar Certainty Factor untuk memberikan hasil yang akurat, meniru cara seorang ahli dalam membuat diagnosa.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="flex flex-col items-center p-4">
                                <span className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full text-2xl font-bold mb-4">1</span>
                                <h3 className="text-xl font-semibold mb-2">Isi Kuesioner</h3>
                                <p className="text-gray-600">Anda menjawab serangkaian pertanyaan yang dirancang untuk mengidentifikasi gejala umum kecanduan gadget.</p>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <span className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full text-2xl font-bold mb-4">2</span>
                                <h3 className="text-xl font-semibold mb-2">Analisis Sistem</h3>
                                <p className="text-gray-600">Setiap jawaban dianalisis menggunakan metode Certainty Factor (CF) yang menggabungkan keyakinan Anda dengan bobot keahlian dalam sistem.</p>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <span className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full text-2xl font-bold mb-4">3</span>
                                <h3 className="text-xl font-semibold mb-2">Hasil & Solusi</h3>
                                <p className="text-gray-600">Sistem memberikan hasil tingkat kecanduan beserta persentase keyakinan, dan rekomendasi solusi yang dipersonalisasi.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">Tim Developer SIPIKAT</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 text-center flex flex-col items-center">
                                <h3 className="text-2xl font-bold text-gray-900">Riyan Triadi</h3>
                                <p className="text-blue-600 font-semibold mb-3">Developer Web SIPIKAT</p>
                                <p className="text-gray-600 mb-2 flex-grow">
                                    Mahasiswa Sistem Informasi dengan ketertarikan pada frontend development menggunakan JavaScript.
                                </p>
                                <TechStackIcons technologies={riyanTechStack} />
                                <div className="flex justify-center space-x-4 mt-auto">
                                    <Link href="https://github.com/RiyanTriadi" className="text-gray-500 hover:text-gray-900 transition-colors">
                                        <Github className="w-6 h-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-500 hover:text-blue-700 transition-colors">
                                        <Linkedin className="w-6 h-6" />
                                    </Link>
                                    <Link href="https://www.instagram.com/ryn3d/" className="text-gray-500 hover:text-pink-600 transition-colors">
                                        <Instagram className="w-6 h-6" />
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 text-center flex flex-col items-center">
                                <h3 className="text-2xl font-bold text-gray-900">Dadi Suhendi</h3>
                                <p className="text-blue-600 font-semibold mb-3">Developer SIPIKAT Mobile</p>
                                <p className="text-gray-600 mb-2 flex-grow">
                                    Memiliki hasrat dalam merancang antarmuka yang intuitif. Percaya bahwa desain yang baik adalah kunci dari teknologi yang bermanfaat.
                                </p>
                                <TechStackIcons technologies={dadiTechStack} />
                                <div className="flex justify-center space-x-4 mt-auto">
                                    <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                                        <Github className="w-6 h-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-500 hover:text-blue-700 transition-colors">
                                        <Linkedin className="w-6 h-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-500 hover:text-pink-600 transition-colors">
                                        <Instagram className="w-6 h-6" />
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