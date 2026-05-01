const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const DEFAULT_AUTH_ERROR = 'Permintaan autentikasi gagal. Silakan coba lagi.';

/**
 * Check if user is authenticated by calling backend
 */
export const checkAuth = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/admin/check`, {
            method: 'GET',
            credentials: 'include', // Include cookies
        });

        if (!res.ok) {
            return { authenticated: false, user: null };
        }

        const data = await res.json();
        return { authenticated: data.authenticated, user: data.user };
    } catch (error) {
        console.error('Auth check failed:', error);
        return { authenticated: false, user: null };
    }
};

/**
 * Refresh access token using refresh token
 * This should be called automatically when access token expires
 */
export const refreshAccessToken = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/admin/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await res.json();
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Token refresh failed:', error);
        return { success: false, error: DEFAULT_AUTH_ERROR };
    }
};

/**
 * Logout helper
 */
export const logout = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/admin/logout`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Logout failed');
        }

        return { success: true };
    } catch (error) {
        console.error('Logout failed:', error);
        return { success: false, error: DEFAULT_AUTH_ERROR };
    }
};

/**
 * Fetch with authentication - automatically handles token refresh
 * Use this for all authenticated API calls
 */
export const fetchWithAuth = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        let res = await fetch(url, mergedOptions);
        
        // If access token expired, try to refresh
        if (res.status === 401) {
            const refreshResult = await refreshAccessToken();
            
            if (refreshResult.success) {
                // Retry original request with new token
                res = await fetch(url, mergedOptions);
            } else {
                // Refresh failed, redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/admin/login';
                }
                throw new Error('Session expired. Please login again.');
            }
        }

        // Handle 403 errors (forbidden/invalid token)
        if (res.status === 403) {
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
            throw new Error('Unauthorized');
        }

        return res;
    } catch (error) {
        throw error;
    }
};

/**
 * Revoke all tokens (logout from all devices)
 */
export const revokeAllTokens = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/admin/revoke-all`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to revoke tokens');
        }

        return { success: true };
    } catch (error) {
        console.error('Revoke tokens failed:', error);
        return { success: false, error: DEFAULT_AUTH_ERROR };
    }
};
