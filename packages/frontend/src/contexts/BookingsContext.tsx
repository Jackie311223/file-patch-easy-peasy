import React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import apiClient from '@/api/axios';
// Import correct types and enums
import { Booking, BookingStatus, Channel, PaymentMethod, PaymentStatus, DepositMethod, DepositStatus } from '../types/booking'; 
// Import FormSchemaType which is the expected input type for create/update
import { FormSchemaType } from '../components/Bookings/BookingForm'; 
import { Property } from '../types/property';
import { RoomType } from '../types/roomType';
import { MOCK_BOOKINGS, mockProperties, mockRoomTypes } from '../mock/mockData'; // Import all mock data
import { useFilter } from './FilterContext';

// Context interface
interface BookingsContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  getBookings: () => Promise<Booking[]>;
  getBooking: (id: string) => Promise<Booking | null>;
  createBooking: (data: FormSchemaType) => Promise<Booking>; // Use FormSchemaType
  updateBooking: (id: string, data: Partial<FormSchemaType>) => Promise<Booking>; // Use Partial<FormSchemaType>
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<void>;
  checkAvailability: (propertyId: string, roomTypeId: string, checkIn: string, checkOut: string, excludeBookingId?: string) => Promise<boolean>;
  isDemoMode: boolean;
}

// Create context - Export the context directly
export const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

// Helper to check if we're in demo mode (Browser-safe)
const isDemoEnvironment = (): boolean => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return hostname.includes('manus.space') || hostname === 'localhost';
};

// Helper function to calculate nights
const calculateNights = (checkIn: string, checkOut: string): number => {
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return 0;
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    console.error("Error calculating nights:", e);
    return 0;
  }
};

// Provider component
export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode] = useState<boolean>(isDemoEnvironment());
  const { filters } = useFilter();

  // Initialize and hydrate mock data in demo mode
  useEffect(() => {
    if (isDemoMode) {
      console.log("BookingsProvider: Hydrating and setting initial mock bookings");
      // Hydrate with necessary nested data (property id/name and roomType id/name)
      const hydratedBookings = MOCK_BOOKINGS.map(b => ({
        ...b,
        // Ensure property object matches the minimal structure in Booking type
        property: mockProperties.find(p => p.id === b.propertyId) 
                    ? { 
                        id: b.propertyId, 
                        name: mockProperties.find(p => p.id === b.propertyId)?.name || 'Unknown Property' 
                      } 
                    : { id: b.propertyId, name: 'Unknown Property' },
        // Add roomType object with non-nullable id
        roomType: mockRoomTypes.find(rt => rt.id === b.roomTypeId)
                    ? {
                        id: b.roomTypeId || '', // Ensure id is never null or undefined
                        name: mockRoomTypes.find(rt => rt.id === b.roomTypeId)?.name || 'Unknown Room Type'
                      }
                    : b.roomTypeId ? { id: b.roomTypeId, name: 'Unknown Room Type' } : { id: '', name: 'Not Specified' }
      }));
      
      // Explicitly cast to Booking[] to ensure type safety
      setBookings(hydratedBookings as Booking[]);
    }
  }, [isDemoMode]);

  // Fetch bookings with filters
  const getBookings = useCallback(async (): Promise<Booking[]> => {
    console.log("BookingsProvider: getBookings called with filters:", filters);
    setLoading(true);
    setError(null);

    try {
      if (isDemoMode) {
        let filteredBookings = [...bookings]; 
        if (filters) {
          if (filters.propertyId) {
            filteredBookings = filteredBookings.filter(booking => booking.propertyId === filters.propertyId);
          }
          // Filter by roomTypeId
          if (filters.roomTypeId) {
            filteredBookings = filteredBookings.filter(booking => booking.roomTypeId === filters.roomTypeId);
          }
          // Filter by bookingStatus
          if (filters.bookingStatus) { 
            filteredBookings = filteredBookings.filter(booking => booking.bookingStatus === filters.bookingStatus);
          }
          // Filter by channel
          if (filters.channel) {
            filteredBookings = filteredBookings.filter(booking => booking.channel === filters.channel);
          }
          // Filter by paymentStatus
          if (filters.paymentStatus) {
            filteredBookings = filteredBookings.filter(booking => booking.paymentStatus === filters.paymentStatus);
          }
          // Filter by date range
          if (filters.startDate) {
            filteredBookings = filteredBookings.filter(booking => new Date(booking.checkIn) >= new Date(filters.startDate!));
          }
          if (filters.endDate) {
            filteredBookings = filteredBookings.filter(booking => new Date(booking.checkOut) <= new Date(filters.endDate!));
          }
          // Filter by search term
          if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredBookings = filteredBookings.filter(booking => 
              booking.guestName.toLowerCase().includes(searchLower) ||
              (booking.contactEmail && booking.contactEmail.toLowerCase().includes(searchLower)) ||
              booking.contactPhone.toLowerCase().includes(searchLower) ||
              (booking.reference && booking.reference.toLowerCase().includes(searchLower))
            );
          }
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        return filteredBookings;
      }

      // Real API call
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
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await apiClient.get(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        const fetchedBookings = response.data;
        setBookings(fetchedBookings);
        return fetchedBookings;
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const errorMessage = 'Request timed out. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage = err.response?.data?.message || 'Failed to fetch bookings';
      setError(errorMessage);
      if (!isDemoMode) {
        return [];
      }
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, bookings, filters]);

  // Fetch a single booking by ID
  const getBooking = useCallback(async (id: string): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const booking = bookings.find(b => b.id === id) || null;
        return booking;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await apiClient.get(`/bookings/${id}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response.data;
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err: any) {
       if (err.name === 'AbortError') {
        const errorMessage = 'Request timed out. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage = err.response?.data?.message || `Failed to fetch booking with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, bookings]);

  // Create a new booking
  const createBooking = useCallback(async (data: FormSchemaType): Promise<Booking> => { 
     setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Construct a full Booking object from FormSchemaType for mock mode
        const newBooking: Booking = {
          id: `booking-${Date.now()}`,
          userId: 'user1', // Mock user ID
          propertyId: data.propertyId,
          roomTypeId: data.roomTypeId || '',
          guestName: data.guestName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          channel: data.channel,
          reference: data.reference,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          nights: calculateNights(data.checkIn, data.checkOut), // Calculate nights
          adults: data.adults, // Already number
          children: data.children || 0, // Already number or undefined
          totalAmount: data.totalAmount, // Already number
          commission: data.commission, // Already number or undefined
          netRevenue: (data.totalAmount || 0) - (data.commission || 0), // Use numbers directly
          currency: data.currency || 'VND',
          paymentMethod: data.paymentMethod,
          paymentChannel: data.paymentChannel,
          paymentStatus: data.paymentStatus || PaymentStatus.UNPAID,
          amountPaid: data.amountPaid || 0, // Already number or undefined
          outstandingBalance: (data.totalAmount || 0) - (data.amountPaid || 0), // Use numbers directly
          refundedAmount: data.refundedAmount, // Already number or undefined
          invoiceUrl: data.invoiceUrl,
          assignedStaff: data.assignedStaff,
          specialRequests: data.specialRequests,
          internalNotes: data.internalNotes,
          bookingStatus: data.bookingStatus || BookingStatus.PENDING, // Default to PENDING
          depositAmount: data.depositAmount, // Already number or undefined
          depositDate: data.depositDate,
          depositMethod: data.depositMethod,
          depositStatus: data.depositStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tenantId: 'tenant1', // Mock tenant ID
          // Add property and roomType objects with non-nullable ids
          property: mockProperties.find(p => p.id === data.propertyId) 
                      ? { id: data.propertyId, name: mockProperties.find(p => p.id === data.propertyId)?.name || 'Unknown Property' } 
                      : { id: data.propertyId, name: 'Unknown Property' },
          roomType: data.roomTypeId && mockRoomTypes.find(rt => rt.id === data.roomTypeId)
                      ? { id: data.roomTypeId, name: mockRoomTypes.find(rt => rt.id === data.roomTypeId)?.name || 'Unknown Room Type' }
                      : { id: data.roomTypeId || '', name: data.roomTypeId ? 'Unknown Room Type' : 'Not Specified' }
        };
        setBookings(prevBookings => [...prevBookings, newBooking]);
        return newBooking;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        // Send FormSchemaType data to API
        const response = await apiClient.post('/bookings', data, { signal: controller.signal }); 
        clearTimeout(timeoutId);
        const newBooking = response.data; // API returns full Booking object
        setBookings(prevBookings => [...prevBookings, newBooking]);
        return newBooking;
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err: any) {
       if (err.name === 'AbortError') {
        const errorMessage = 'Request timed out. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage = err.response?.data?.message || 'Failed to create booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, bookings]); // Added bookings dependency

  // Update an existing booking
  const updateBooking = useCallback(async (id: string, data: Partial<FormSchemaType>): Promise<Booking> => { 
     setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const bookingIndex = bookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) {
          throw new Error(`Booking with ID ${id} not found`);
        }
        const existingBooking = bookings[bookingIndex];
        // Create updated booking object carefully merging FormSchemaType data
        const updatedBooking: Booking = {
          ...existingBooking,
          // Update fields present in data, using numbers directly
          ...(data.guestName && { guestName: data.guestName }),
          ...(data.contactEmail && { contactEmail: data.contactEmail }),
          ...(data.contactPhone && { contactPhone: data.contactPhone }),
          ...(data.channel && { channel: data.channel }),
          ...(data.reference && { reference: data.reference }),
          ...(data.checkIn && { checkIn: data.checkIn }),
          ...(data.checkOut && { checkOut: data.checkOut }),
          ...(data.checkIn && data.checkOut && { nights: calculateNights(data.checkIn, data.checkOut) }),
          ...(data.adults && { adults: data.adults }),
          ...(data.children !== undefined && { children: data.children }), // Allow 0 children
          ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
          ...(data.commission !== undefined && { commission: data.commission }),
          ...(data.currency && { currency: data.currency }),
          ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
          ...(data.paymentChannel && { paymentChannel: data.paymentChannel }),
          ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
          ...(data.amountPaid !== undefined && { amountPaid: data.amountPaid }),
          ...(data.refundedAmount !== undefined && { refundedAmount: data.refundedAmount }),
          ...(data.invoiceUrl && { invoiceUrl: data.invoiceUrl }),
          ...(data.assignedStaff && { assignedStaff: data.assignedStaff }),
          ...(data.specialRequests && { specialRequests: data.specialRequests }),
          ...(data.internalNotes && { internalNotes: data.internalNotes }),
          ...(data.bookingStatus && { bookingStatus: data.bookingStatus }),
          ...(data.depositAmount !== undefined && { depositAmount: data.depositAmount }),
          ...(data.depositDate && { depositDate: data.depositDate }),
          ...(data.depositMethod && { depositMethod: data.depositMethod }),
          ...(data.depositStatus && { depositStatus: data.depositStatus }),
          updatedAt: new Date().toISOString(),
        };
        
        // Calculate derived fields if relevant fields changed
        if (data.totalAmount !== undefined || data.commission !== undefined) {
          updatedBooking.netRevenue = (updatedBooking.totalAmount || 0) - (updatedBooking.commission || 0);
        }
        if (data.totalAmount !== undefined || data.amountPaid !== undefined) {
          updatedBooking.outstandingBalance = (updatedBooking.totalAmount || 0) - (updatedBooking.amountPaid || 0);
        }
        
        // Update bookings array
        const updatedBookings = [...bookings];
        updatedBookings[bookingIndex] = updatedBooking;
        setBookings(updatedBookings);
        return updatedBooking;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        // Send FormSchemaType data to API
        const response = await apiClient.patch(`/bookings/${id}`, data, { signal: controller.signal }); 
        clearTimeout(timeoutId);
        const updatedBooking = response.data; // API returns full Booking object
        setBookings(prevBookings => 
          prevBookings.map(booking => booking.id === id ? updatedBooking : booking)
        );
        return updatedBooking;
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err: any) {
       if (err.name === 'AbortError') {
        const errorMessage = 'Request timed out. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage = err.response?.data?.message || `Failed to update booking with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, bookings]); // Added bookings dependency

  // Update booking status only
  const updateBookingStatus = useCallback(async (id: string, status: BookingStatus): Promise<Booking> => {
    return updateBooking(id, { bookingStatus: status });
  }, [updateBooking]);

  // Delete a booking
  const deleteBooking = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
        return;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        await apiClient.delete(`/bookings/${id}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        setBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err: any) {
       if (err.name === 'AbortError') {
        const errorMessage = 'Request timed out. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage = err.response?.data?.message || `Failed to delete booking with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, bookings]); // Added bookings dependency

  // Check availability for a room type
  const checkAvailability = useCallback(async (
    propertyId: string, 
    roomTypeId: string, 
    checkIn: string, 
    checkOut: string,
    excludeBookingId?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 300));
        // Simple mock availability check
        const roomType = mockRoomTypes.find(rt => rt.id === roomTypeId);
        if (!roomType) {
          throw new Error(`Room type with ID ${roomTypeId} not found`);
        }
        
        // Get all bookings for this room type in the date range
        const overlappingBookings = bookings.filter(booking => 
          booking.roomTypeId === roomTypeId &&
          booking.bookingStatus !== BookingStatus.CANCELLED &&
          booking.id !== excludeBookingId &&
          // Check for date overlap
          ((new Date(booking.checkIn) <= new Date(checkOut)) && 
           (new Date(booking.checkOut) >= new Date(checkIn)))
        );
        
        // Count total booked rooms for this period
        const bookedRooms = overlappingBookings.length;
        
        // Check if there's availability
        return bookedRooms < roomType.quantity;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await apiClient.get('/bookings/check-availability', { 
          params: { propertyId, roomTypeId, checkIn, checkOut, excludeBookingId },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response.data.available;
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err: any) {
       if (err.name === 'AbortError') {
        const errorMessage = 'Request timed out. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage = err.response?.data?.message || 'Failed to check availability';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, bookings, mockRoomTypes]); // Added dependencies

  // Memoize context value
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
    checkAvailability,
    isDemoMode
  }), [
    bookings,
    loading,
    error,
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    checkAvailability,
    isDemoMode
  ]);

  return (
    <BookingsContext.Provider value={contextValue}>
      {children}
    </BookingsContext.Provider>
  );
};

// Custom hook to use the context
export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};
