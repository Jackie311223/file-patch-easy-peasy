import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookingStatus, Channel, PaymentStatus } from '../types/booking';

// Define filter types
export interface BookingFilters {
  propertyId?: string;
  roomTypeId?: string;
  startDate?: string;
  endDate?: string;
  bookingStatus?: BookingStatus;
  channel?: Channel;
  paymentStatus?: PaymentStatus;
  searchTerm?: string;
}

// Context interface
interface FilterContextType {
  filters: BookingFilters;
  setFilter: (key: keyof BookingFilters, value: string | undefined) => void;
  setFilters: (filters: Partial<BookingFilters>) => void; // Add batch update method
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

// Create context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Provider component
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL params
  const initialFilters: BookingFilters = useMemo(() => {
    return {
      propertyId: searchParams.get('propertyId') || undefined,
      roomTypeId: searchParams.get('roomTypeId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      bookingStatus: (searchParams.get('bookingStatus') as BookingStatus) || undefined,
      channel: (searchParams.get('channel') as Channel) || undefined,
      paymentStatus: (searchParams.get('paymentStatus') as PaymentStatus) || undefined,
      searchTerm: searchParams.get('searchTerm') || undefined,
    };
  }, [searchParams]);

  const [filters, setFiltersState] = useState<BookingFilters>(initialFilters);

  // Update URL when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    // Only add defined filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        newSearchParams.set(key, value);
      }
    });
    
    setSearchParams(newSearchParams);
  }, [filters, setSearchParams]);

  // Set a single filter
  const setFilter = useCallback((key: keyof BookingFilters, value: string | undefined) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Set multiple filters at once
  const setFilters = useCallback((newFilters: Partial<BookingFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== undefined && value !== '');
  }, [filters]);

  return (
    <FilterContext.Provider value={{ filters, setFilter, setFilters, clearFilters, hasActiveFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

// Custom hook to use the filter context
export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
