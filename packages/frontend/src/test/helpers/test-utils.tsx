import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Create a fresh Query Client for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Mock auth context values for different user roles
export const mockAuthContextValues = {
  SUPER_ADMIN: {
    user: {
      id: 'super-admin-id',
      name: 'Super Admin',
      email: 'admin@roomrise.com',
      role: 'SUPER_ADMIN',
      tenantId: 'system',
    },
    isAuthenticated: true,
    permissions: {
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canManageUsers: true,
    },
  },
  PARTNER: {
    user: {
      id: 'partner-id',
      name: 'Partner User',
      email: 'partner@example.com',
      role: 'PARTNER',
      tenantId: 'tenant-a',
    },
    isAuthenticated: true,
    permissions: {
      canCreate: true,
      canUpdate: true,
      canDelete: false,
      canManageUsers: false,
    },
  },
  STAFF: {
    user: {
      id: 'staff-id',
      name: 'Staff User',
      email: 'staff@example.com',
      role: 'STAFF',
      tenantId: 'tenant-a',
    },
    isAuthenticated: true,
    permissions: {
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManageUsers: false,
    },
  },
};

// Mock AuthContext
export const AuthContext = React.createContext(mockAuthContextValues.PARTNER);

// Mock ThemeContext
export const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: jest.fn(),
  primaryColor: '#4f46e5',
  tenantLogo: '/logo.png',
});

// Create a wrapper with all providers
interface AllProvidersProps {
  children: React.ReactNode;
  userRole?: 'SUPER_ADMIN' | 'PARTNER' | 'STAFF';
  theme?: 'light' | 'dark';
}

export const AllProviders: React.FC<AllProvidersProps> = ({ 
  children, 
  userRole = 'PARTNER',
  theme = 'light',
}) => {
  const queryClient = createTestQueryClient();
  const authValue = mockAuthContextValues[userRole];
  const themeValue = {
    theme,
    toggleTheme: jest.fn(),
    primaryColor: theme === 'dark' ? '#818cf8' : '#4f46e5',
    tenantLogo: '/logo.png',
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          <ThemeContext.Provider value={themeValue}>
            {children}
            <ToastContainer />
          </ThemeContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  userRole?: 'SUPER_ADMIN' | 'PARTNER' | 'STAFF';
  theme?: 'light' | 'dark';
}

export function customRender(
  ui: ReactElement,
  { 
    userRole = 'PARTNER',
    theme = 'light',
    ...renderOptions 
  }: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const user = userEvent.setup();
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders userRole={userRole} theme={theme}>
      {children}
    </AllProviders>
  );

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Helper for testing accessibility
export async function checkAccessibility(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
}

// Helper for testing responsive behavior
export function resizeScreenSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
  window.dispatchEvent(new Event('resize'));
}

// Screen size presets
export const screenSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  largeDesktop: { width: 1920, height: 1080 },
};

// Helper for testing modals
export function getModalElements() {
  return {
    dialog: document.querySelector('[role="dialog"]'),
    closeButton: document.querySelector('[aria-label="Close"]'),
    overlay: document.querySelector('[data-overlay="true"]'),
  };
}

// Helper for testing form accessibility
export function checkFormAccessibility(formElement: HTMLElement) {
  // Check if all inputs have associated labels
  const inputs = formElement.querySelectorAll('input, select, textarea');
  const formControls = Array.from(inputs);
  
  formControls.forEach(control => {
    const id = control.getAttribute('id');
    if (id) {
      const label = formElement.querySelector(`label[for="${id}"]`);
      expect(label).not.toBeNull();
    } else {
      // If no ID, check if input is wrapped in a label
      const parentLabel = control.closest('label');
      expect(parentLabel).not.toBeNull();
    }
  });
  
  // Check if required fields are marked
  const requiredInputs = formElement.querySelectorAll('[aria-required="true"], [required]');
  requiredInputs.forEach(input => {
    const id = input.getAttribute('id');
    if (id) {
      const label = formElement.querySelector(`label[for="${id}"]`);
      expect(label?.textContent).toMatch(/\*/);
    }
  });
  
  // Check if error messages are properly associated
  const invalidInputs = formElement.querySelectorAll('[aria-invalid="true"]');
  invalidInputs.forEach(input => {
    const id = input.getAttribute('id');
    if (id) {
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).not.toBeNull();
      const errorElement = document.getElementById(errorId || '');
      expect(errorElement).not.toBeNull();
    }
  });
}

// Re-export everything from RTL
export * from '@testing-library/react';
export { userEvent };
