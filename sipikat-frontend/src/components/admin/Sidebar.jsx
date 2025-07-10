//src/components/admin/Sidebar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    ListChecks, 
    Newspaper, 
    History, 
    Users, 
    LogOut, 
    X, 
    Menu,
    ShieldCheck
} from 'lucide-react';

// Definisikan link navigasi dengan ikon
const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Kelola Gejala', href: '/admin/dashboard/gejala', icon: ListChecks },
    { name: 'Kelola Artikel', href: '/admin/dashboard/artikel', icon: Newspaper },
    { name: 'Riwayat Diagnosa', href: '/admin/dashboard/diagnosa', icon: History },
    { name: 'Kelola Akun', href: '/admin/dashboard/akun', icon: Users },
];

// Komponen untuk setiap item navigasi
function NavLink({ link, pathname }) {
    const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
    
    return (
        <Link
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ease-in-out
                ${isActive 
                    ? 'bg-slate-800 text-white font-semibold shadow-inner' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`
            }
        >
            <link.icon className="h-5 w-5" />
            <span>{link.name}</span>
        </Link>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        // Tambahkan konfirmasi sebelum logout untuk UX yang lebih baik
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('adminToken');
            router.push('/admin/login');
        }
    };
    
    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-slate-900 text-white">
            {/* Header Sidebar */}
            <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2.5 text-xl font-bold">
                    <ShieldCheck className="h-7 w-7 text-indigo-400" />
                    <span>Admin Panel</span>
                </Link>
                {/* Tombol Close untuk mobile */}
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden rounded-full p-1.5 hover:bg-slate-700">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Navigasi Utama */}
            <nav className="flex-1 space-y-2 px-4 py-6">
                {navLinks.map((link) => (
                    <NavLink key={link.name} link={link} pathname={pathname} />
                ))}
            </nav>

            {/* Footer Sidebar (Logout) */}
            <div className="border-t border-slate-700/50 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 transition-all duration-200 ease-in-out hover:bg-red-500/20 hover:text-red-400"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* --- Sidebar untuk Desktop (selalu terlihat) & Mobile (slide-in) --- */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* --- Header untuk Mobile (berisi tombol hamburger) --- */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
                 <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    <span>Admin Panel</span>
                </Link>
                <button onClick={() => setIsSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                    <Menu className="h-6 w-6" />
                </button>
            </header>
            
            {/* --- Overlay saat sidebar mobile terbuka --- */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </>
    );
}