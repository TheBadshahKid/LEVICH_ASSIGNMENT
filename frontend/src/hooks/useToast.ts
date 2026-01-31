import { useState, useEffect } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

let toastId = 0;

const listeners: Array<(toast: Toast) => void> = [];

export const showToast = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const toast: Toast = {
        id: `toast-${toastId++}`,
        message,
        type,
        duration
    };

    listeners.forEach(listener => listener(toast));
};

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const handleToast = (toast: Toast) => {
            setToasts(prev => [...prev, toast]);

            if (toast.duration) {
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                }, toast.duration);
            }
        };

        listeners.push(handleToast);

        return () => {
            const index = listeners.indexOf(handleToast);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, removeToast };
};
