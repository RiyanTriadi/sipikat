'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { checkAuth } from '@/lib/auth';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const { authenticated } = await checkAuth();
                
                if (!authenticated) {
                    router.push('/admin/login');
                } else {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                router.push('/admin/login');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [router]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memverifikasi autentikasi...</p>
                </div>
            </div>
        );
    }

    // Don't render dashboard until authenticated
    if (!isAuthenticated) {
        return null;
    }
    
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="md:ml-64">
                {children}
            </main>
        </div>
    );
}