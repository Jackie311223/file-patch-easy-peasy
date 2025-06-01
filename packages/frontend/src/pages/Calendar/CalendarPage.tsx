import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, keepPreviousData, QueryKey, RefetchOptions, QueryObserverResult } from '@tanstack/react-query'; 
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice } from '@/utils/deviceDetection';
import { useSearchParams } from 'react-router-dom'; 

// Components
import CalendarHeader from './components/CalendarHeader';
import CalendarFilters from './components/CalendarFilters';
import TimelineGrid from './components/TimelineGrid'; 
import BookingModal from './components/BookingModal';
import { LoadingSpinner } from '@/ui/Loading/Spinner'; 
import ErrorMessage from '@/components/common/ErrorMessage'; 
import PageHeader from '@/ui/PageHeader'; 

// API
import { getCalendarData, updateBookingDates, assignRoom, AssignRoomParams } from '@/api/calendarApi'; 

// Styles
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarPage.css'; 

// Định nghĩa types
interface Room {
  id: string;
  name: string;
  roomTypeId: string;
  roomTypeName: string; 
  status: string; 
}

interface Booking {
  id: string;
  guestName: string;
  checkIn: string | Date;
  checkOut: string | Date;
  roomId: string;
  roomName: string; 
  roomTypeId: string; 
  roomTypeName: string; 
  status: string; 
  nights: number; 
  source: string; 
  notes?: string;
  isVIP?: boolean;
  totalAmount: number; 
}

interface CalendarData {
  rooms: Room[];
  bookings: Booking[];
}

const localizer = momentLocalizer(moment);
const dndBackend = isTouchDevice() ? TouchBackend : HTML5Backend;

const CalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams(); 
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }), 
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  });
  const [filters, setFilters] = useState({
    propertyId: "",
    bookingStatus: [] as string[],
    roomTypeId: "",
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      console.log('Fetching properties (mock)');
      return [
        { id: 'property-1', name: 'Beach Resort' },
        { id: 'property-2', name: 'Mountain Lodge' },
      ];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (properties && properties.length > 0 && !filters.propertyId) {
      setFilters(prev => ({ ...prev, propertyId: properties[0].id }));
    }
  }, [properties, filters.propertyId]);

  useEffect(() => {
    if (viewMode === 'week') {
      setDateRange({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      });
    } else { 
      setDateRange({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      });
    }
  }, [currentDate, viewMode]);

  const {
    data: calendarData,
    isLoading: calendarLoading,
    isError: calendarError,
    error, 
    refetch: refetchCalendar,
  } = useQuery<CalendarData, Error, CalendarData, QueryKey>({ 
    queryKey: ['calendar', filters.propertyId, dateRange.start.toISOString(), dateRange.end.toISOString(), filters.bookingStatus, filters.roomTypeId] as QueryKey, 
    queryFn: () => getCalendarData({ 
      propertyId: filters.propertyId,
      startDate: format(dateRange.start, 'yyyy-MM-dd'),
      endDate: format(dateRange.end, 'yyyy-MM-dd'),
      bookingStatus: filters.bookingStatus.length > 0 ? filters.bookingStatus : undefined,
      roomTypeId: filters.roomTypeId || undefined,
    }),
    enabled: !!filters.propertyId,
    staleTime: 1 * 60 * 1000,
    placeholderData: keepPreviousData, 
  });

  const handleViewModeChange = (mode: 'week' | 'month') => {
    setViewMode(mode);
    setCurrentDate(new Date()); 
  };

  const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
    } else {
      const newDate = viewMode === 'week'
        ? (direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7))
        : (direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
      setCurrentDate(newDate);
    }
  };

  const handleFilterChange = (newFilters: Partial<Omit<typeof filters, 'bookingStatus'> & { bookingStatus?: string | string[] }>) => { 
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters,
      bookingStatus: typeof newFilters.bookingStatus === 'string' && newFilters.bookingStatus !== "" 
                       ? [newFilters.bookingStatus] 
                       : (Array.isArray(newFilters.bookingStatus) ? newFilters.bookingStatus : []),
      page: 1 
    })); 
  };

  const handleBookingClick = (booking: Booking) => { 
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleBookingDrag = async (bookingId: string, newDates: { start: Date; end: Date }, newRoomId?: string) => { 
    try {
      if (newRoomId) { 
        const params: AssignRoomParams = { bookingId, roomId: newRoomId };
        await assignRoom(params);
      } else { 
        await updateBookingDates(bookingId, {
          checkIn: format(newDates.start, 'yyyy-MM-dd'),
          checkOut: format(newDates.end, 'yyyy-MM-dd'),
        });
      }
      refetchCalendar();
    } catch (err) { 
      console.error('Error updating booking from drag:', err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleBookingUpdate = async (updatedBooking: Partial<Booking> & { id: string }) => { 
    try {
      console.log('Updating booking from modal (mock):', updatedBooking);
      refetchCalendar();
      handleModalClose();
    } catch (err) {
      console.error('Error updating booking from modal:', err);
    }
  };

  if (propertiesLoading) { 
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
  
  if (calendarError && !calendarLoading) { 
    const specificError = error as Error; 
    return <div className="p-4 md:p-6"><ErrorMessage message={specificError?.message || "Failed to load calendar data. Please try again."} 
    /></div>;
  }

  return (
    <div className="calendar-page p-4 md:p-6">
      <PageHeader title="Calendar View" /> 
      
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
          viewMode={viewMode}
          dateRange={dateRange}
          rooms={calendarData?.rooms || []} 
          bookings={calendarData?.bookings || []} 
          onBookingClick={handleBookingClick}
          // Sửa: Sử dụng đúng tên prop là onBookingDragProp và onRoomChangeProp
          onBookingDragProp={handleBookingDrag}
          onRoomChangeProp={(bookingId, newRoomId, newDates) => handleBookingDrag(bookingId, newDates, newRoomId)} 
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