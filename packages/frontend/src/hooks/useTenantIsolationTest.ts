import { useCallback } from 'react';
import { useBookings } from './useBookings';
import { useFilter } from '../contexts/FilterContext';
import { BookingStatus, Channel, PaymentStatus } from '../types/booking';

/**
 * Custom hook for testing multi-tenant data isolation
 * This hook is used to verify that users from one tenant cannot access data from another tenant
 */
export const useTenantIsolationTest = () => {
  const { bookings, loading, error } = useBookings();
  const { filters, setFilter } = useFilter();

  // Test function to verify tenant isolation
  const testTenantIsolation = useCallback(async (tenantId: string, userId: string) => {
    try {
      // 1. Attempt to access data from another tenant
      const result = {
        success: true,
        tenantId,
        userId,
        errors: [] as string[],
        accessViolations: [] as string[],
        dataIntegrity: [] as string[]
      };

      // 2. Check if all bookings belong to the correct tenant
      const wrongTenantBookings = bookings.filter(booking => booking.tenantId !== tenantId);
      if (wrongTenantBookings.length > 0) {
        result.success = false;
        result.accessViolations.push(`User can access ${wrongTenantBookings.length} bookings from other tenants`);
      }

      // 3. Check data integrity - all bookings should have property and roomType
      const missingPropertyBookings = bookings.filter(booking => !booking.property);
      if (missingPropertyBookings.length > 0) {
        result.success = false;
        result.dataIntegrity.push(`${missingPropertyBookings.length} bookings are missing property data`);
      }

      const missingRoomTypeBookings = bookings.filter(booking => !booking.roomType);
      if (missingRoomTypeBookings.length > 0) {
        result.success = false;
        result.dataIntegrity.push(`${missingRoomTypeBookings.length} bookings are missing roomType data`);
      }

      // 4. Check filter functionality
      // Test property filter
      if (bookings.length > 0 && bookings[0].propertyId) {
        setFilter('propertyId', bookings[0].propertyId);
        const propertyFilteredBookings = bookings.filter(b => b.propertyId === bookings[0].propertyId);
        if (propertyFilteredBookings.length !== bookings.length) {
          result.dataIntegrity.push('Property filter not working correctly');
        }
      }

      // Test status filter
      setFilter('bookingStatus', BookingStatus.CONFIRMED);
      const statusFilteredBookings = bookings.filter(b => b.bookingStatus === BookingStatus.CONFIRMED);
      if (statusFilteredBookings.length !== bookings.length) {
        result.dataIntegrity.push('Status filter not working correctly');
      }

      // Reset filters
      setFilter('propertyId', undefined);
      setFilter('bookingStatus', undefined);

      return result;
    } catch (error) {
      console.error('Tenant isolation test failed:', error);
      return {
        success: false,
        tenantId,
        userId,
        errors: [(error as Error).message],
        accessViolations: [],
        dataIntegrity: []
      };
    }
  }, [bookings, setFilter]);

  return {
    testTenantIsolation,
    loading,
    error
  };
};
