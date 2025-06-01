import React, { ReactElement, createContext, ReactNode } from 'react'; // Thêm ReactNode
import { render, RenderOptions, RenderResult, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify'; 
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, Mock } from 'vitest'; 

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Create a fresh Query Client for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, 
      staleTime: Infinity, 
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Định nghĩa type cho User object
interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[]; 
  tenantId: string | null; 
}

// Định nghĩa type cho giá trị của AuthContext
export interface AuthContextType {
  user: AuthUser | null; 
  isAuthenticated: boolean;
  permissions: { 
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
    canManageUsers?: boolean;
  };
  login: Mock<(email: string, password: string) => Promise<void>>;
  logout: Mock<() => Promise<void>>;
  signup: Mock<(data: any) => Promise<any>>; 
  updateUser: Mock<(data: any) => Promise<any>>; 
  checkAuth: Mock<() => Promise<AuthUser | null>>; 
}


export const mockAuthContextValues: Record<'SUPER_ADMIN' | 'PARTNER' | 'STAFF' | 'LOGGED_OUT', AuthContextType> = {
  SUPER_ADMIN: {
    user: {
      id: 'super-admin-id',
      name: 'Super Admin',
      email: 'admin@roomrise.com',
      roles: ['SUPER_ADMIN'], 
      tenantId: null, 
    },
    isAuthenticated: true,
    permissions: {
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canManageUsers: true,
    },
    login: vi.fn(async (email, password) => {}),
    logout: vi.fn(async () => {}),
    signup: vi.fn(async (data) => ({})), 
    updateUser: vi.fn(async (data) => ({})), 
    checkAuth: vi.fn().mockResolvedValue({ id: 'super-admin-id', name: 'Super Admin', email: 'admin@roomrise.com', roles: ['SUPER_ADMIN'], tenantId: null } as AuthUser),
  },
  PARTNER: {
    user: {
      id: 'partner-id',
      name: 'Partner User',
      email: 'partner@example.com',
      roles: ['PARTNER'], 
      tenantId: 'tenant-a',
    },
    isAuthenticated: true,
    permissions: {
      canCreate: true,
      canUpdate: true,
      canDelete: false,
      canManageUsers: false,
    },
    login: vi.fn(async (email, password) => {}),
    logout: vi.fn(async () => {}),
    signup: vi.fn(async (data) => ({})),
    updateUser: vi.fn(async (data) => ({})),
    checkAuth: vi.fn().mockResolvedValue({ id: 'partner-id', name: 'Partner User', email: 'partner@example.com', roles: ['PARTNER'], tenantId: 'tenant-a' } as AuthUser),
  },
  STAFF: {
    user: {
      id: 'staff-id',
      name: 'Staff User',
      email: 'staff@example.com',
      roles: ['STAFF'], 
      tenantId: 'tenant-a',
    },
    isAuthenticated: true,
    permissions: {
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManageUsers: false,
    },
    login: vi.fn(async (email, password) => {}),
    logout: vi.fn(async () => {}),
    signup: vi.fn(async (data) => ({})),
    updateUser: vi.fn(async (data) => ({})),
    checkAuth: vi.fn().mockResolvedValue({ id: 'staff-id', name: 'Staff User', email: 'staff@example.com', roles: ['STAFF'], tenantId: 'tenant-a' } as AuthUser),
  },
  LOGGED_OUT: {
    user: null,
    isAuthenticated: false,
    permissions: {}, 
    login: vi.fn(async (email, password) => {}),
    logout: vi.fn(async () => {}),
    signup: vi.fn(async (data) => ({})),
    updateUser: vi.fn(async (data) => ({})),
    checkAuth: vi.fn().mockResolvedValue(null),
  }
};

export const AuthContext = createContext<AuthContextType>(mockAuthContextValues.LOGGED_OUT);

export interface ThemeContextType { 
  theme: 'light' | 'dark';
  toggleTheme: Mock<() => void>; 
  primaryColor: string;
  tenantLogo: string;
  setTheme: Mock<(themeOrUpdater: 'light' | 'dark' | ((theme: 'light' | 'dark') => 'light' | 'dark')) => void>; 
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: vi.fn(), 
  primaryColor: '#4f46e5',
  tenantLogo: '/logo.png',
  setTheme: vi.fn(), 
});

interface AllProvidersProps {
  children: React.ReactNode;
  userRole?: keyof typeof mockAuthContextValues; 
  themeValue?: Partial<ThemeContextType>; 
}

export const AllProviders: React.FC<AllProvidersProps> = ({ 
  children, 
  userRole = 'LOGGED_OUT', 
  themeValue: themeProp,
}) => {
  const [queryClient] = React.useState(() => createTestQueryClient()); 
  const authValue = mockAuthContextValues[userRole];
  
  const defaultThemeValue: ThemeContextType = {
    theme: 'light',
    toggleTheme: vi.fn(), 
    setTheme: vi.fn(),
    primaryColor: '#4f46e5',
    tenantLogo: '/logo.png',
  };
  const currentThemeValue = { ...defaultThemeValue, ...themeProp };


  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter> 
        <AuthContext.Provider value={authValue}>
          <ThemeContext.Provider value={currentThemeValue}>
            {children}
            <ToastContainer autoClose={500} /> 
          </ThemeContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  userRole?: keyof typeof mockAuthContextValues;
  themeValue?: Partial<ThemeContextType>;
}

export function customRender(
  ui: ReactElement,
  { 
    userRole = 'LOGGED_OUT',
    themeValue,
    ...renderOptions 
  }: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } { 
  const user = userEvent.setup();
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders userRole={userRole} themeValue={themeValue}>
      {children}
    </AllProviders>
  );

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export async function checkAccessibility(containerOrElement: HTMLElement | Element) {
  const htmlElement = containerOrElement instanceof HTMLElement ? containerOrElement : document.body;
  const results = await axe(htmlElement);
  expect(results).toHaveNoViolations();
  return results;
}

export function resizeScreenSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
  window.dispatchEvent(new Event('resize'));
}

export const screenSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  largeDesktop: { width: 1920, height: 1080 },
};

export function getModalElements() {
  return {
    dialog: document.querySelector('[role="dialog"]'), 
  };
}

export function checkFormAccessibility(formElement: HTMLElement) {
  const inputs = formElement.querySelectorAll('input:not([type="hidden"]), select, textarea');
  const formControls = Array.from(inputs) as HTMLElement[]; 
  
  formControls.forEach(control => {
    const id = control.getAttribute('id');
    let label: HTMLLabelElement | null = null;
    if (id) {
      label = formElement.querySelector(`label[for="${id}"]`);
    }
    if (!label) { 
        label = control.closest('label');
    }
    if (!label && !control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby')) {
        console.warn(`Accessibility issue: Control missing label or aria-label/labelledby:`, control);
    }
  });
}

export * from '@testing-library/react';
export { userEvent };