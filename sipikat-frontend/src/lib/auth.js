export const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('adminToken');
    }
    return null;
};

export const setAuthToken = (token) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', token);
    }
};

export const removeAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
    }
};