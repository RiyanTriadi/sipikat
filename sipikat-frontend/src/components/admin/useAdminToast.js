'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION = 3000;

export default function useAdminToast() {
    const [toast, setToast] = useState({ show: false, title: '', message: '' });
    const timeoutRef = useRef(null);

    const clearToastTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const hideToast = useCallback(() => {
        clearToastTimer();
        setToast(prev => ({ ...prev, show: false }));
    }, [clearToastTimer]);

    const showToast = useCallback((title, message = '', duration = DEFAULT_DURATION) => {
        clearToastTimer();
        setToast({ show: true, title, message });
        timeoutRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
            timeoutRef.current = null;
        }, duration);
    }, [clearToastTimer]);

    useEffect(() => () => clearToastTimer(), [clearToastTimer]);

    return { toast, showToast, hideToast };
}
