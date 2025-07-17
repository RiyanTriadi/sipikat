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
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="md:ml-64">
                {children}
            </main>
        </div>
    );
}
