const API_BASE_URL = process.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Check if user is authenticated by calling backend
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

// Logout helper
export const logout = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/admin/logout`, {
            method: 'POST',
            credentials: 'include', // Include cookies
        });

        if (!res.ok) {
            throw new Error('Logout failed');
        }

        return { success: true };
    } catch (error) {
        console.error('Logout failed:', error);
        return { success: false, error: error.message };
    }
};

// Fetch with authentication - use this for all API calls
export const fetchWithAuth = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include', // Always include cookies
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
        const res = await fetch(url, mergedOptions);
        
        // Handle 401/403 errors globally
        if (res.status === 401 || res.status === 403) {
            // Redirect to login if unauthorized
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