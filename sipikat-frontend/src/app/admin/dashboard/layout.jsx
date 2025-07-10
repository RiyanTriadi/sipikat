'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default function DashboardLayout({ children }) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
        }
    }, [router]);
    
    return (
        // Hapus `flex` dari sini. Biarkan elemen di dalamnya mengatur posisinya sendiri.
        // Ganti background menjadi `bg-slate-50` agar konsisten.
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            
            {/* - `md:ml-64` adalah KUNCI untuk layout desktop. 
                Ini mendorong konten utama ke kanan (memberi ruang untuk sidebar w-64).
              - Di mobile, margin ini tidak berlaku, sehingga konten utama bisa menggunakan
                seluruh lebar layar di bawah header mobile.
            */}
            <main className="md:ml-64">
                {children}
            </main>
        </div>
    );
}
