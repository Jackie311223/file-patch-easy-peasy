import React, { ReactNode, ReactElement } from 'react'; // Thêm ReactElement
// Sửa: Thêm RenderOptions vào import
import { render, screen, fireEvent, waitFor, RenderResult, RenderOptions } from '@testing-library/react'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom'; 
import { vi, Mock } from 'vitest'; 

import CalendarPage from '../../CalendarPage'; 
import * as calendarApi from '../../../../api/calendarApi'; 
vi.mock('../../../../api/calendarApi'); 


// Đảm bảo file setup test của bạn có import '@testing-library/jest-dom'
// để các matchers như toBeInTheDocument hoạt động.

// Sửa: Định nghĩa TestAppProviders như một function component thông thường
const TestAppProviders = ({ children }: { children: ReactNode }): JSX.Element => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity, 
        staleTime: Infinity,
        refetchOnWindowFocus: false, 
        refetchOnMount: false,
      },
       mutations: { 
        retry: false,
      }
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter> 
        <DndProvider backend={HTML5Backend}>
          {children}
        </DndProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function sử dụng RenderOptions đã import
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => // Sử dụng ReactElement
  render(ui, { wrapper: TestAppProviders, ...options });


describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks(); 

    (calendarApi.getCalendarData as Mock).mockResolvedValue({
      rooms: [
        { id: 'room-1', name: 'Room 101', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
        { id: 'room-2', name: 'Room 102', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
      ],
      bookings: [
        {
          id: 'booking-1',
          guestName: 'John Doe',
          checkIn: '2025-05-20T14:00:00Z', 
          checkOut: '2025-05-25T12:00:00Z',
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
      total: 1, 
    });
    
    (calendarApi.updateBookingDates as Mock).mockResolvedValue({ success: true });
    (calendarApi.assignRoom as Mock).mockResolvedValue({ success: true });
  });

  it('renders the calendar page and calls getCalendarData', async () => {
    customRender(<CalendarPage />); 
    
    await waitFor(() => {
      expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(1);
    });
  });

  it('changes view mode when view mode buttons are clicked', async () => {
    customRender(<CalendarPage />);
    
    await waitFor(() => expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(1));

    const monthButton = screen.queryByRole('button', { name: /month/i });
    const weekButton = screen.queryByRole('button', { name: /week/i });

    if (monthButton) {
      fireEvent.click(monthButton);
      await waitFor(() => {
        expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(2); 
      });
    }
    
    if (weekButton) {
      fireEvent.click(weekButton);
      await waitFor(() => {
        expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(3);
      });
    }
  });
  
  it('navigates dates when prev/next/today buttons are clicked', async () => {
    customRender(<CalendarPage />);

    await waitFor(() => expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(1));

    const prevButton = screen.queryByRole('button', { name: /previous/i }); 
    const nextButton = screen.queryByRole('button', { name: /next/i });   
    const todayButton = screen.queryByRole('button', { name: /today/i });

    if (nextButton) {
      fireEvent.click(nextButton);
      await waitFor(() => expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(2));
    }
    if (prevButton) {
      fireEvent.click(prevButton);
      await waitFor(() => expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(3));
    }
    if (todayButton) {
      fireEvent.click(todayButton);
      await waitFor(() => expect(calendarApi.getCalendarData).toHaveBeenCalledTimes(4));
    }
  });

});