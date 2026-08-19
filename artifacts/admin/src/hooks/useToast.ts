import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastFn: ((message: string, type?: ToastType) => void) | null = null;

// Global toast trigger usable outside React
export function showToast(opts: string | { message: string; type?: ToastType }, type: ToastType = 'info') {
  if (typeof opts === 'string') {
    toastFn?.(opts, type);
  } else {
    toastFn?.(opts.message, opts.type || 'info');
  }
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Register global
  toastFn = addToast;

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export function useToast() {
  return {
    toast: (opts: string | { message: string; type?: ToastType }, type: ToastType = 'success') => {
      showToast(opts, type);
    },
  };
}
