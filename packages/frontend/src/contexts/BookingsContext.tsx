import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import apiClient from '@/api/axios';
import {
  Booking, BookingStatus, PaymentStatus
} from '../types/booking';
import { FormSchemaType } from '../components/Bookings/BookingForm';
import { useFilter } from './FilterContext';

interface BookingsContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  getBookings: () => Promise<Booking[]>;
  getBooking: (id: string) => Promise<Booking | null>;
  createBooking: (data: FormSchemaType) => Promise<Booking>;
  updateBooking: (id: string, data: Partial<FormSchemaType>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<void>;
  isDemoMode: boolean;
}

export const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

const isDemoEnvironment = (): boolean => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return hostname.includes('manus.space') || hostname === 'localhost';
};

export const BookingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode] = useState<boolean>(isDemoEnvironment());
  const { filters } = useFilter();

  const getBookings = useCallback(async (): Promise<Booking[]> => {
    setLoading(true);
    setError(null);
    try {
      let url = '/bookings';
      const queryParams = new URLSearchParams();
      if (filters) {
        if (filters.propertyId) queryParams.append('propertyId', filters.propertyId);
        if (filters.roomTypeId) queryParams.append('roomTypeId', filters.roomTypeId);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.bookingStatus) queryParams.append('bookingStatus', filters.bookingStatus);
        if (filters.channel) queryParams.append('channel', filters.channel);
        if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
        if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
      }
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await apiClient.get(url);
      setBookings(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch bookings';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const getBooking = useCallback(async (id: string): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to fetch booking with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (data: FormSchemaType): Promise<Booking> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/bookings', data);
      setBookings(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (id: string, data: Partial<FormSchemaType>): Promise<Booking> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/bookings/${id}`, data);
      setBookings(prev => prev.map(b => (b.id === id ? response.data : b)));
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to update booking with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: BookingStatus): Promise<Booking> => {
    return updateBooking(id, { bookingStatus: status });
  }, [updateBooking]);

  const deleteBooking = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to delete booking with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    bookings,
    loading,
    error,
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    isDemoMode
  }), [bookings, loading, error, getBookings, getBooking, createBooking, updateBooking, updateBookingStatus, deleteBooking, isDemoMode]);

  return (
    <BookingsContext.Provider value={contextValue}>
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) throw new Error('useBookings must be used within a BookingsProvider');
  return context;
};