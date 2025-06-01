import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
// Giả định './Toast.tsx' (PascalCase) export named 'Toast' (component) và 'ToastProps'.
// Và ToastProps định nghĩa một prop là 'type' để xác định kiểu của Toast,
// và kiểu đó là 'success' | 'error' | 'warning' | 'info'.
import { Toast, ToastProps as SingleToastComponentProps } from './Toast'; 

// Định nghĩa các loại Toast - Bỏ 'default' nếu component Toast không hỗ trợ
export type ToastType = 'success' | 'error' | 'warning' | 'info'; 

// Tùy chọn khi gọi hàm addToast
export interface ToastOptions { 
  type?: ToastType; // Giờ đây type sẽ không bao gồm 'default'
  duration?: number; 
  title?: ReactNode; 
  action?: {
    label: string;
    onClick: () => void; 
  };
}

// SingleToastComponentProps là props của component Toast hiển thị đơn lẻ.
// ToastItem là state nội bộ của Provider.
interface ToastItem extends Omit<SingleToastComponentProps, 
  'onDismiss' | 
  'children'  | 
  'message'   | 
  'title'     | 
  'variant'   | // Omit 'variant' nếu SingleToastComponentProps có nó và chúng ta dùng 'type'
  'type'      | // Omit 'type' nếu SingleToastComponentProps có nó và chúng ta dùng 'type' của ToastItem
  'action'    |
  'id'          
> {
  id: string; 
  message: string; 
  type: ToastType; // Đây là 'type' mà ToastItem quản lý, đã bỏ 'default'
  duration: number;   
  title?: ReactNode; 
  action?: ToastOptions['action'];
}

interface ToastContextType {
  addToast: (message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => { 
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode; defaultDuration?: number }> = ({ 
  children, 
  defaultDuration = 5000 
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, options: ToastOptions = {}): string => {
    const id = `toast-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    
    const newToast: ToastItem = {
      id,
      title: options.title, 
      message, 
      type: options.type || 'info', // Nếu options.type là undefined, sẽ dùng 'info'.
                                   // Nếu options.type là một giá trị từ ToastType (đã bỏ 'default'), nó sẽ được dùng.
      duration: options.duration !== undefined ? options.duration : defaultDuration,
      action: options.action, 
    };

    setToasts(prevToasts => [newToast, ...prevToasts]); 
    return id;
  }, [defaultDuration]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  useEffect(() => {
    const activeTimers: NodeJS.Timeout[] = [];
    toasts.forEach(toast => {
      if (toast.duration !== Infinity && toast.duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(toast.id);
        }, toast.duration);
        activeTimers.push(timer);
      }
    });
    return () => {
      activeTimers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, dismissToast]);


  return (
    <ToastContext.Provider value={{ addToast, dismissToast, dismissAllToasts }}>
      {children}
      <div 
        aria-live="assertive" 
        className="fixed top-4 right-4 z-[100] flex flex-col items-end space-y-2 w-full max-w-xs sm:max-w-sm" 
      >
        {toasts.map(toastItem => (
          <Toast
            key={toastItem.id}
            message={toastItem.title ? `${String(toastItem.title)} - ${toastItem.message}` : toastItem.message}
            type={toastItem.type} // Giờ đây toastItem.type sẽ không bao giờ là 'default'
            action={toastItem.action}
            onDismiss={() => dismissToast(toastItem.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};