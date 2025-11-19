'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { checkAuth, refreshAccessToken } from '@/lib/auth';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const refreshIntervalRef = useRef(null);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const { authenticated } = await checkAuth();
                
                if (!authenticated) {
                    router.push('/admin/login');
                } else {
                    setIsAuthenticated(true);
                    setupTokenRefresh();
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                router.push('/admin/login');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();

        // Cleanup on unmount
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [router]);

    /**
     * Setup automatic token refresh
     * Refresh token 1 minute before expiry (14 minutes for 15-minute tokens)
     */
    const setupTokenRefresh = () => {
        // Clear any existing interval
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }

        // Refresh every 14 minutes (1 minute before 15-minute expiry)
        const refreshInterval = 14 * 60 * 1000;

        refreshIntervalRef.current = setInterval(async () => {
            console.log('Refreshing access token...');
            const result = await refreshAccessToken();
            
            if (!result.success) {
                console.error('Token refresh failed, redirecting to login');
                clearInterval(refreshIntervalRef.current);
                router.push('/admin/login');
            } else {
                console.log('Access token refreshed successfully');
            }
        }, refreshInterval);

        // Also refresh immediately if token is close to expiry
        // This handles cases where user opens app with old token
        setTimeout(async () => {
            const result = await refreshAccessToken();
            if (!result.success) {
                router.push('/admin/login');
            }
        }, 1000);
    };

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