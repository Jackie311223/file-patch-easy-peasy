# Thiết kế kiến trúc UI/UX cho PMS Roomrise

## 1. Tổng quan

Tài liệu này mô tả chi tiết thiết kế kiến trúc UI/UX cho PMS Roomrise, bao gồm foundation, theme system, provider hierarchy, và cấu trúc component tái sử dụng. Thiết kế này nhằm nâng cấp trải nghiệm người dùng lên chuẩn SaaS thương mại cao cấp.

## 2. Kiến trúc Foundation

### 2.1. Cấu trúc thư mục

```
src/
├── components/         # Component theo tính năng
├── contexts/           # Global contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── ui/                 # Reusable UI components
│   ├── Button/
│   ├── Form/
│   ├── Modal/
│   ├── Toast/
│   └── index.ts        # Export all UI components
├── utils/              # Utility functions
├── constants/
│   └── ui.ts           # UI constants
├── theme/
│   ├── ThemeProvider.tsx
│   └── ui.config.ts    # Design tokens
└── providers/
    └── AppProviders.tsx # All providers wrapped
```

### 2.2. Provider Hierarchy

```jsx
<AppProviders>
  <ThemeProvider>
    <ToastProvider>
      <LoadingProvider>
        <TenantThemeProvider>
          <SuggestionProvider>
            <OnboardingProvider>
              <App />
            </OnboardingProvider>
          </SuggestionProvider>
        </TenantThemeProvider>
      </LoadingProvider>
    </ToastProvider>
  </ThemeProvider>
</AppProviders>
```

## 3. Design Tokens & Theme System

### 3.1. Design Tokens (ui.config.ts)

```typescript
// src/theme/ui.config.ts
export const colors = {
  // Brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  // Semantic colors
  success: {
    light: '#ecfdf5',
    DEFAULT: '#10b981',
    dark: '#065f46',
  },
  warning: {
    light: '#fffbeb',
    DEFAULT: '#f59e0b',
    dark: '#92400e',
  },
  error: {
    light: '#fef2f2',
    DEFAULT: '#ef4444',
    dark: '#991b1b',
  },
  info: {
    light: '#eff6ff',
    DEFAULT: '#3b82f6',
    dark: '#1e40af',
  },
};

export const spacing = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
};

export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

export const zIndices = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1100',
  fixed: '1200',
  overlay: '1300',
  modal: '1400',
  popover: '1500',
  toast: '1600',
  tooltip: '1700',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const transitions = {
  DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export default {
  colors,
  spacing,
  fontSizes,
  fontWeights,
  lineHeights,
  borderRadius,
  shadows,
  zIndices,
  breakpoints,
  transitions,
};
```

### 3.2. Theme Provider

```typescript
// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    // Default to system
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  // Update theme in localStorage and document
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  // Effect to handle system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches);
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };
    
    // Initial setup
    if (theme === 'system') {
      setIsDark(mediaQuery.matches);
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
    } else {
      setIsDark(theme === 'dark');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 3.3. Tenant Theme Provider

```typescript
// src/theme/TenantThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface TenantTheme {
  primaryColor: string;
  logoUrl: string;
  fontFamily: string;
  borderRadius: string;
}

interface TenantThemeContextType {
  tenantTheme: TenantTheme;
  updateTenantTheme: (theme: Partial<TenantTheme>) => void;
}

const defaultTheme: TenantTheme = {
  primaryColor: '#0ea5e9', // Default blue
  logoUrl: '/logo.svg',
  fontFamily: 'Inter, sans-serif',
  borderRadius: '0.25rem',
};

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(undefined);

export const useTenantTheme = () => {
  const context = useContext(TenantThemeContext);
  if (context === undefined) {
    throw new Error('useTenantTheme must be used within a TenantThemeProvider');
  }
  return context;
};

export const TenantThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tenantTheme, setTenantTheme] = useState<TenantTheme>(defaultTheme);

  // Fetch tenant theme from API based on user's tenantId
  useEffect(() => {
    if (user?.tenantId) {
      // In a real implementation, this would be an API call
      // fetchTenantTheme(user.tenantId).then(setTenantTheme);
      
      // For now, we'll simulate with different themes based on tenantId
      const mockThemes: Record<string, Partial<TenantTheme>> = {
        'tenant-1': { primaryColor: '#0ea5e9', logoUrl: '/tenant1-logo.svg' },
        'tenant-2': { primaryColor: '#10b981', logoUrl: '/tenant2-logo.svg' },
        'tenant-3': { primaryColor: '#8b5cf6', logoUrl: '/tenant3-logo.svg' },
      };
      
      const tenantTheme = mockThemes[user.tenantId];
      if (tenantTheme) {
        setTenantTheme(prev => ({ ...prev, ...tenantTheme }));
      }
    }
  }, [user?.tenantId]);

  // Apply tenant theme to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', tenantTheme.primaryColor);
    document.documentElement.style.setProperty('--font-family', tenantTheme.fontFamily);
    document.documentElement.style.setProperty('--border-radius', tenantTheme.borderRadius);
  }, [tenantTheme]);

  const updateTenantTheme = (theme: Partial<TenantTheme>) => {
    setTenantTheme(prev => ({ ...prev, ...theme }));
  };

  return (
    <TenantThemeContext.Provider value={{ tenantTheme, updateTenantTheme }}>
      {children}
    </TenantThemeContext.Provider>
  );
};
```

## 4. Toast Notification System

### 4.1. Toast Provider

```typescript
// src/ui/Toast/ToastProvider.tsx
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
```

### 4.2. Toast Component

```typescript
// src/ui/Toast/Toast.tsx
import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, action, onDismiss }) => {
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-success" />,
    error: <XCircleIcon className="h-5 w-5 text-error" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-warning" />,
    info: <InformationCircleIcon className="h-5 w-5 text-info" />,
  };

  const bgColors = {
    success: 'bg-success-light',
    error: 'bg-error-light',
    warning: 'bg-warning-light',
    info: 'bg-info-light',
  };

  return (
    <div
      className={`${bgColors[type]} rounded-md p-4 shadow-md flex items-start transition-all duration-300 ease-in-out`}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{message}</p>
        {action && (
          <div className="mt-2">
            <button
              type="button"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
        onClick={onDismiss}
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
```

## 5. Loading State Management

### 5.1. Loading Provider

```typescript
// src/ui/Loading/LoadingProvider.tsx
import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  loadingState: Record<string, boolean>;
  setLoadingState: (key: string, isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingStateRecord] = useState<Record<string, boolean>>({});

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const setLoadingState = (key: string, loading: boolean) => {
    setLoadingStateRecord(prev => ({
      ...prev,
      [key]: loading,
    }));
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        startLoading,
        stopLoading,
        loadingState,
        setLoadingState,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
```

### 5.2. Spinner Component

```typescript
// src/ui/Loading/Spinner.tsx
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
  };

  return (
    <div className={`${className}`} role="status">
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 
(Content truncated due to size limit. Use line ranges to read in chunks)