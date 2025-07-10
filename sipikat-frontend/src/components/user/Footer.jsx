import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-300 font-sans">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div className="px-4">
                        <h3 className="text-xl font-bold text-white mb-4">SIPKAT</h3>
                        <p className="text-gray-400 max-w-sm mx-auto md:mx-0">
                            Sistem pakar untuk membantu Anda mengidentifikasi dan memahami tingkat kecanduan gadget secara personal.
                        </p>
                    </div>

                    <div className="px-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Tautan Cepat</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="hover:text-indigo-400 transition-colors">
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href="/diagnosa" className="hover:text-indigo-400 transition-colors">
                                    Mulai Diagnosa
                                </Link>
                            </li>
                            <li>
                                <Link href="/artikel" className="hover:text-indigo-400 transition-colors">
                                    Artikel
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} SIPAKAT. Seluruh hak cipta dilindungi.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
