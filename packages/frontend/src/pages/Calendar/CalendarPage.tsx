import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice } from '@/utils/deviceDetection'; // Corrected import path

// Components
import CalendarHeader from './components/CalendarHeader';
import CalendarFilters from './components/CalendarFilters';
import TimelineGrid from './components/TimelineGrid';
import BookingModal from './components/BookingModal';
import LoadingSpinner from '@/ui/Loading/Spinner'; // Corrected import usage
import ErrorMessage from '@/components/common/ErrorMessage'; // Using stub

// API
import { getCalendarData, updateBookingDates, assignRoom } from '@/api/calendarApi'; // Corrected import path

// Styles
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarPage.css';

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Backend for drag and drop based on device
const dndBackend = isTouchDevice() ? TouchBackend : HTML5Backend;

const CalendarPage = () => {
  // State
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week'); // Explicitly type the state
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });  const [filters, setFilters] = useState({
    propertyId: 
      "",
    bookingStatus: [] as string[], // Explicitly type as string[]
    roomTypeId: 
      "",
  });
  const [selectedBooking, setSelectedBooking] = useState<any>(null); // Added type any for now, replace with Booking type later
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch properties for filter dropdown
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'], // v5 syntax
    queryFn: async () => { // v5 syntax
      // Replace with actual API call
      return [
        { id: 'property-1', name: 'Beach Resort' },
        { id: 'property-2', name: 'Mountain Lodge' },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set default property when properties are loaded
  useEffect(() => {
    if (properties && properties.length > 0 && !filters.propertyId) {
      setFilters(prev => ({ ...prev, propertyId: properties[0].id }));
    }
  }, [properties, filters.propertyId]); // Added filters.propertyId dependency

  // Fetch calendar data
  const {
    data: calendarData,
    isLoading: calendarLoading,
    isError: calendarError,
    refetch: refetchCalendar,
  } = useQuery({
    queryKey: ['calendar', filters.propertyId, dateRange.start, dateRange.end, filters.bookingStatus, filters.roomTypeId], // v5 syntax
    queryFn: () => getCalendarData({ // v5 syntax
      propertyId: filters.propertyId,
      startDate: format(dateRange.start, 'yyyy-MM-dd'),
      endDate: format(dateRange.end, 'yyyy-MM-dd'),
      bookingStatus: filters.bookingStatus.length > 0 ? filters.bookingStatus : undefined,
      roomTypeId: filters.roomTypeId || undefined,
    }),
    enabled: !!filters.propertyId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Handle view mode change (week/month)
  const handleViewModeChange = (mode: 'week' | 'month') => { // Added type
    setViewMode(mode);
    if (mode === 'week') {
      setDateRange({
        start: startOfWeek(new Date()),
        end: endOfWeek(new Date()),
      });
    } else {
      setDateRange({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      });
    }
  };

  // Handle date navigation
  const handleDateChange = (direction: 'prev' | 'next' | 'today') => { // Added type
    if (viewMode === 'week') {
      if (direction === 'prev') {
        setDateRange(prev => ({
          start: subDays(prev.start, 7),
          end: subDays(prev.end, 7),
        }));
      } else if (direction === 'next') {
        setDateRange(prev => ({
          start: addDays(prev.start, 7),
          end: addDays(prev.end, 7),
        }));
      } else if (direction === 'today') {
        setDateRange({
          start: startOfWeek(new Date()),
          end: endOfWeek(new Date()),
        });
      }
    } else {
      // Assuming month view logic needs adjustment for 30 days
      const daysToAdjust = 30; // Or calculate based on current month
      if (direction === 'prev') {
        setDateRange(prev => ({
          start: subDays(startOfMonth(prev.start), daysToAdjust), // Adjust logic if needed
          end: endOfMonth(subDays(startOfMonth(prev.start), daysToAdjust)),
        }));
      } else if (direction === 'next') {
        setDateRange(prev => ({
          start: addDays(startOfMonth(prev.start), daysToAdjust), // Adjust logic if needed
          end: endOfMonth(addDays(startOfMonth(prev.start), daysToAdjust)),
        }));
      } else if (direction === 'today') {
        setDateRange({
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date()),
        });
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => { // Added type
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle booking click
  const handleBookingClick = (booking: any) => { // Added type
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Handle booking drag
  const handleBookingDrag = async (bookingId: string, newDates: { start: Date; end: Date }) => { // Added types
    try {
      await updateBookingDates(bookingId, {
        checkIn: format(newDates.start, 'yyyy-MM-dd'),
        checkOut: format(newDates.end, 'yyyy-MM-dd'),
      });
      refetchCalendar();
    } catch (error) {
      console.error('Error updating booking dates:', error);
      // Show error notification
    }
  };

  // Handle room change
  const handleRoomChange = async (bookingId: string, roomId: string) => { // Added types
    try {
      await assignRoom({
        bookingId,
        roomId,
      });
      refetchCalendar();
    } catch (error) {
      console.error('Error assigning room:', error);
      // Show error notification
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Handle booking update from modal
  const handleBookingUpdate = async (updatedBooking: any) => { // Added type
    try {
      // Call API to update booking
      // ...
      refetchCalendar();
      handleModalClose();
    } catch (error) {
      console.error('Error updating booking:', error);
      // Show error notification
    }
  };

  // Loading state
  if (propertiesLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (calendarError) {
    return <ErrorMessage message="Failed to load calendar data. Please try again." />;
  }

  return (
    <div className="calendar-page">
      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        dateRange={dateRange}
        onDateChange={handleDateChange}
      />
      
      <CalendarFilters
        properties={properties || []}
        selectedProperty={filters.propertyId}
        selectedStatus={filters.bookingStatus}
        selectedRoomType={filters.roomTypeId}
        onFilterChange={handleFilterChange}
      />
      
      <DndProvider backend={dndBackend}>
        <TimelineGrid
          isLoading={calendarLoading}
          viewMode={viewMode as 'week' | 'month'} // Explicitly cast to the expected union type
          dateRange={dateRange}
          rooms={calendarData?.rooms || []}
          bookings={calendarData?.bookings || []}
          onBookingClick={handleBookingClick}
          onBookingDrag={handleBookingDrag}
          onRoomChange={handleRoomChange}
        />
      </DndProvider>
      
      {isModalOpen && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={handleBookingUpdate}
        />
      )}
    </div>
  );
};

export default CalendarPage;

