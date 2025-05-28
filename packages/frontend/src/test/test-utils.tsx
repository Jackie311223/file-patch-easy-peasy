import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth'; // Assuming AuthProvider is exported from useAuth

// Create a client
const queryClient = new QueryClient();

// Define the provider component
export const TestProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          {children}
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
// export { customRender as render }; // Commenting out custom render if not needed or defined
