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
    ShieldCheck,
    Lightbulb,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { logout } from '@/lib/auth'; // Import logout helper
import AdminToast from '@/components/admin/AdminToast';
import useAdminToast from '@/components/admin/useAdminToast';

const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Kelola Gejala', href: '/admin/dashboard/gejala', icon: ListChecks },
    { name: 'Kelola Artikel', href: '/admin/dashboard/artikel', icon: Newspaper },
    { name: 'Kelola Solusi', href: '/admin/dashboard/solusi', icon: Lightbulb },
    { name: 'Riwayat Diagnosa', href: '/admin/dashboard/diagnosa', icon: History },
    { name: 'Kelola Akun', href: '/admin/dashboard/akun', icon: Users },
];

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

function LogoutConfirmationModal({ isOpen, onCancel, onConfirm, isLoading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-slate-900">Konfirmasi Logout</h3>
                    <p className="mt-2 text-sm text-slate-600">Apakah Anda yakin ingin keluar dari dashboard admin?</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-lg border border-slate-300 px-5 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center justify-center rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                        {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Keluar...</> : 'Ya, Logout'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { toast, showToast, hideToast } = useAdminToast();

    const openLogoutModal = () => {
        setShowLogoutModal(true);
        setIsSidebarOpen(false);
    };

    const closeLogoutModal = () => {
        if (!isLoggingOut) {
            setShowLogoutModal(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            const result = await logout();

            if (result.success) {
                setShowLogoutModal(false);
                router.push('/admin/login');
            } else {
                showToast('Logout gagal', 'Sesi belum berhasil diakhiri. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Terjadi kesalahan', 'Terjadi masalah saat logout. Silakan coba lagi.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-slate-900 text-white">
            <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2.5 text-xl font-bold">
                    <ShieldCheck className="h-7 w-7 text-blue-400" />
                    <span>Admin Panel</span>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden rounded-full p-1.5 hover:bg-slate-700">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-6">
                {navLinks.map((link) => (
                    <NavLink key={link.name} link={link} pathname={pathname} />
                ))}
            </nav>

            <div className="border-t border-slate-700/50 p-4">
                <button
                    onClick={openLogoutModal}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 transition-all duration-200 ease-in-out hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                            <span>Logging out...</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <AdminToast toast={toast} onClose={hideToast} />
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-slate-900 px-4 md:hidden">
                 <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-bold text-white">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                    <span>Admin Panel</span>
                </Link>
                <button onClick={() => setIsSidebarOpen(true)} className="rounded-lg p-2 text-slate-100 hover:bg-slate-600">
                    <Menu className="h-6 w-6" />
                </button>
            </header>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <LogoutConfirmationModal
                isOpen={showLogoutModal}
                onCancel={closeLogoutModal}
                onConfirm={handleLogout}
                isLoading={isLoggingOut}
            />
        </>
    );
}
