import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '@/api/axios';
import { Property, PropertyData } from '../types/property';
import { mockProperties } from '../mock/mockData';

// Context interface
interface PropertiesContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  getProperties: () => Promise<Property[]>;
  getProperty: (id: string) => Promise<Property | null>;
  createProperty: (data: PropertyData) => Promise<Property>;
  updateProperty: (id: string, data: PropertyData) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  isDemoMode: boolean;
}

// Create context
const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

// Helper to check if we're in demo mode (Browser-safe)
const isDemoEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return hostname.includes('manus.space') || hostname === 'localhost';
};

// Determine demo mode synchronously ONCE
const DEMO_MODE = isDemoEnvironment();

// Provider component
export const PropertiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state directly based on DEMO_MODE
  const [properties, setProperties] = useState<Property[]>(DEMO_MODE ? mockProperties : []);
  const [loading, setLoading] = useState<boolean>(!DEMO_MODE); // Start loading only if not in demo mode
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode] = useState<boolean>(DEMO_MODE); // Use the constant

  // Fetch all properties (only if not in demo mode)
  const getProperties = useCallback(async (): Promise<Property[]> => {
    if (isDemoMode) {
      console.log("[PropertiesProvider] Demo mode - returning mock properties from state");
      return properties; // Return already initialized state
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/properties');
      const fetchedProperties = response.data;
      setProperties(fetchedProperties);
      return fetchedProperties;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch properties';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, properties]); // Include properties in dependency array for demo mode return

  // Fetch a single property by ID
  const getProperty = useCallback(async (id: string): Promise<Property | null> => {
    if (isDemoMode) {
      console.log(`[PropertiesProvider] Demo mode - finding mock property with ID: ${id} from state`);
      // Find directly from the initialized state
      const property = properties.find(p => p.id === id) || null;
      if (!property) {
         console.warn(`[PropertiesProvider] Demo mode - mock property with ID: ${id} not found in state`);
         // Throw an error consistent with API failure for better handling downstream
         throw new Error(`Failed to fetch property with ID: ${id}`);
      }
      return property;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/properties/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to fetch property with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, properties]); // Include properties in dependency array

  // Create a new property
  const createProperty = useCallback(async (data: PropertyData): Promise<Property> => {
    if (isDemoMode) {
      console.log("[PropertiesProvider] Demo mode - simulating property creation");
      const newProperty: Property = {
        id: `prop-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProperties(prevProperties => [...prevProperties, newProperty]);
      return newProperty;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/properties', data);
      const newProperty = response.data;
      setProperties(prevProperties => [...prevProperties, newProperty]);
      return newProperty;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create property';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  // Update an existing property
  const updateProperty = useCallback(async (id: string, data: PropertyData): Promise<Property> => {
    if (isDemoMode) {
      console.log(`[PropertiesProvider] Demo mode - simulating property update for ID: ${id}`);
      const updatedProperty: Property = {
        id,
        ...data,
        updatedAt: new Date().toISOString()
      };
      setProperties(prevProperties =>
        prevProperties.map(property =>
          property.id === id ? { ...property, ...updatedProperty } : property
        )
      );
      return updatedProperty;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/properties/${id}`, data);
      const updatedProperty = response.data;
      setProperties(prevProperties =>
        prevProperties.map(property =>
          property.id === id ? updatedProperty : property
        )
      );
      return updatedProperty;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to update property with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  // Delete a property
  const deleteProperty = useCallback(async (id: string): Promise<void> => {
    if (isDemoMode) {
      console.log(`[PropertiesProvider] Demo mode - simulating property deletion for ID: ${id}`);
      setProperties(prevProperties =>
        prevProperties.filter(property => property.id !== id)
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/properties/${id}`);
      setProperties(prevProperties =>
        prevProperties.filter(property => property.id !== id)
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to delete property with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  // Load properties on mount - only if not in demo mode and not already loaded
  useEffect(() => {
    if (!isDemoMode && properties.length === 0) {
      getProperties().catch(err => {
        console.error('Error loading properties on mount:', err);
        // Error state is already set within getProperties
      });
    }
    // No dependency on getProperties to avoid potential loops if it wasn't memoized correctly
  }, [isDemoMode, properties.length]);

  // Memoize the context value
  const contextValue = {
    properties,
    loading,
    error,
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    isDemoMode
  };

  return (
    <PropertiesContext.Provider value={contextValue}>
      {children}
    </PropertiesContext.Provider>
  );
};

// Custom hook to use the properties context
export const useProperties = (): PropertiesContextType => {
  const context = useContext(PropertiesContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};

