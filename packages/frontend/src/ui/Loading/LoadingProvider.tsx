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
