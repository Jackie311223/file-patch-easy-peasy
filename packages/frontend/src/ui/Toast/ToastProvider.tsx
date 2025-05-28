import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastProps } from './Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItem extends ToastProps {
  id: string;
}

interface ToastContextType {
  toast: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (message: string, options: ToastOptions = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      action: options.action,
      onDismiss: () => dismiss(id),
    };

    setToasts(prev => [...prev, newToast]);

    // Auto dismiss after duration
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }

    return id;
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      <div className="fixed bottom-0 right-0 z-toast p-4 space-y-2 max-w-md">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
