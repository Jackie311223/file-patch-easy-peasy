import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CalendarPage from './CalendarPage';
import * as calendarApi from '../../api/calendarApi';

// Mock the API calls
jest.mock('../../api/calendarApi');

// Create a wrapper with necessary providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        {children}
      </DndProvider>
    </QueryClientProvider>
  );
};

describe('CalendarPage', () => {
  beforeEach(() => {
    // Mock API responses
    (calendarApi.getCalendarData as jest.Mock).mockResolvedValue({
      rooms: [
        { id: 'room-1', name: 'Room 101', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
        { id: 'room-2', name: 'Room 102', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
      ],
      bookings: [
        {
          id: 'booking-1',
          guestName: 'John Doe',
          checkIn: '2025-05-20',
          checkOut: '2025-05-25',
          nights: 5,
          status: 'CONFIRMED',
          roomId: 'room-1',
          roomName: 'Room 101',
          roomTypeId: 'type-1',
          roomTypeName: 'Standard',
          source: 'Direct',
          totalAmount: 500,
        },
      ],
    });
    
    (calendarApi.updateBookingDates as jest.Mock).mockResolvedValue({
      success: true,
    });
    
    (calendarApi.assignRoom as jest.Mock).mockResolvedValue({
      success: true,
    });
  });
  
  it('renders the calendar page with header and filters', async () => {
    render(<CalendarPage />, { wrapper: createWrapper() });
    
    // Check for header elements
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    
    // Check for filter elements
    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Room Type')).toBeInTheDocument();
    
    // Wait for calendar data to load
    await waitFor(() => {
      expect(calendarApi.getCalendarData).toHaveBeenCalled();
    });
  });
  
  it('changes view mode when clicking week/month buttons', async () => {
    render(<CalendarPage />, { wrapper: createWrapper() });
    
    // Click on Month button
    fireEvent.click(screen.getByText('Month'));
    
    // Verify that the view mode changed
    await waitFor(() => {
      expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(2);
    });
    
    // Click on Week button
    fireEvent.click(screen.getByText('Week'));
    
    // Verify that the view mode changed back
    await waitFor(() => {
      expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(3);
    });
  });
  
  it('navigates dates when clicking prev/next buttons', async () => {
    render(<CalendarPage />, { wrapper: createWrapper() });
    
    // Find navigation buttons
    const prevButton = screen.getByLabelText('Previous');
    const nextButton = screen.getByLabelText('Next');
    
    // Click on Next button
    fireEvent.click(nextButton);
    
    // Verify that the date range changed
    await waitFor(() => {
      expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(2);
    });
    
    // Click on Previous button
    fireEvent.click(prevButton);
    
    // Verify that the date range changed back
    await waitFor(() => {
      expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(3);
    });
  });
  
  // Note: Testing drag and drop functionality requires more complex setup
  // with react-dnd-test-backend and is beyond the scope of this basic test file
});
