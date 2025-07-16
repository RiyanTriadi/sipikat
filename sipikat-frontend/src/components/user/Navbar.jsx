// src/components/user/Navbar.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Beranda" },
        { href: "/diagnosa", label: "Diagnosa" },
        { href: "/artikel", label: "Artikel" },
        { href: "/tentang", label: "Tentang" },
    ];

    // Effect untuk mendeteksi scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    
    // Effect untuk menutup menu mobile saat halaman berubah
    useEffect(() => {
        if(isOpen) {
            setIsOpen(false);
        }
    }, [pathname]);

    // --- PERUBAHAN UTAMA DI SINI ---
    // Fungsi untuk kelas styling link desktop
    const linkClasses = (href) => {
        const isActive = pathname === href;
        const baseClasses = 'relative px-1 py-2 text-sm font-medium text-gray-700 transition-colors duration-300 outline-none';
        const activeClasses = 'font-semibold text-blue-600';
        const inactiveClasses = 'hover:text-blue-600';
        // Kelas untuk pseudo-element ::after (garis bawah)
        const afterClasses = `
            after:content-[''] after:absolute after:left-0 after:bottom-0 
            after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300
        `;
        const activeAfter = 'after:w-full';
        const inactiveAfter = 'after:w-0 group-hover:after:w-full';

        return `group ${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${afterClasses} ${isActive ? activeAfter : inactiveAfter}`;
    };

    // Fungsi untuk kelas styling link mobile
    const mobileLinkClasses = (href) => 
        `block px-3 py-2 rounded-md text-base font-medium text-center ${
            pathname === href 
            ? 'bg-blue-100 text-blue-700 font-semibold' 
            : 'text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-lg backdrop-blur-lg' : 'bg-white border-b border-gray-200'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-blue-600">
                            SIPAKAT
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} className={linkClasses(link.href)}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block">
                         <Link href="/admin/login" className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Admin Login
                        </Link>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu Mobile */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className={mobileLinkClasses(link.href)}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center justify-center px-5">
                             <Link href="/admin/login" className="w-full text-center inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}