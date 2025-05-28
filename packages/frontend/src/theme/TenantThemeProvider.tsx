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
