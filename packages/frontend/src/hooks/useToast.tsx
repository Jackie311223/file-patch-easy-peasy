import React, { useState, useCallback } from 'react';

type ToastStatus = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  title: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  let nextId = 0;

  const toast = useCallback((props: ToastProps) => {
    const id = nextId++;
    setToasts((current) => [...current, { ...props, id }]);
    
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, props.duration || 3000);
  }, []);

  // Component Toast
  const Toast = useCallback(() => {
    if (toasts.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const status = toast.status || 'info';
          const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
          }[status];
          
          return (
            <div 
              key={toast.id} 
              className={`p-4 ${bgColor} text-white rounded-md shadow-lg min-w-[300px] max-w-md`}
              style={{ 
                animation: 'slideIn 0.3s ease-out forwards' 
              }}
            >
              <div className="flex justify-between">
                <h3 className="font-bold">{toast.title}</h3>
                <button 
                  onClick={() => setToasts(current => current.filter(t => t.id !== toast.id))}
                  className="text-white"
                >
                  ×
                </button>
              </div>
              {toast.description && <p>{toast.description}</p>}
            </div>
          );
        })}
        
        <style>
          {`
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}
        </style>
      </div>
    );
  }, [toasts]);

  return { toast, Toast };
};