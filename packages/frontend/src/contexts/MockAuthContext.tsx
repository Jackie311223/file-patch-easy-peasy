// src/contexts/MockAuthContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

// Define a basic user type for the mock context
interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string; // Use string or a mock enum if needed
  tenantId: string;
}

// Define the shape of the mock context
interface MockAuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: MockUser) => void;
  logout: () => void;
}

// Create the mock context with default values
const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

// Create the mock provider component
export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const mockUser: MockUser = {
    id: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
    role: 'ADMIN', // Default role for testing
    tenantId: 'mock-tenant-id',
  };

  const value: MockAuthContextType = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    login: () => { console.log('Mock login called'); },
    logout: () => { console.log('Mock logout called'); },
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

// Custom hook to use the mock context (optional, if needed elsewhere)
export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

