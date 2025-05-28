import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { customRender, checkAccessibility } from '../../../test/helpers/test-utils';
import TimelineGrid from '../components/TimelineGrid';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Mock dependencies
jest.mock('react-big-calendar', () => {
  const RBC = jest.requireActual('react-big-calendar');
  return {
    ...RBC,
    Calendar: ({ events, resources, components, resourceIdAccessor }) => (
      <div data-testid="mock-calendar" className="calendar-timeline">
        <div data-testid="calendar-resources">
          {resources.map((resource) => (
            <div key={resource[resourceIdAccessor]} data-testid={`resource-${resource[resourceIdAccessor]}`}>
              {resource.name}
            </div>
          ))}
        </div>
        <div data-testid="calendar-events">
          {events.map((event) => (
            <div key={event.id} data-testid={`event-${event.id}`}>
              {components.event({ event })}
            </div>
          ))}
        </div>
      </div>
    ),
    Views: {
      WEEK: 'week',
      MONTH: 'month',
    },
    momentLocalizer: () => ({}),
  };
});

// Mock BookingBlock component
jest.mock('../components/BookingBlock', () => {
  return function MockBookingBlock({ booking, onClick }) {
    return (
      <div 
        data-testid={`booking-block-${booking.id}`}
        onClick={() => onClick(booking)}
      >
        {booking.guestName} - {booking.roomName}
      </div>
    );
  };
});

// Mock LoadingSpinner component
jest.mock('../../../components/common/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

describe('TimelineGrid', () => {
  const mockOnBookingClick = jest.fn();
  const mockOnBookingDrag = jest.fn();
  const mockOnRoomChange = jest.fn();
  
  const defaultProps = {
    isLoading: false,
    viewMode: 'week' as const,
    dateRange: {
      start: new Date('2025-06-01'),
      end: new Date('2025-06-08'),
    },
    rooms: [
      { id: 'room-1', name: 'Room 101', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
      { id: 'room-2', name: 'Room 102', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
      { id: 'room-3', name: 'Room 201', roomTypeId: 'type-2', roomTypeName: 'Deluxe', status: 'AVAILABLE' },
    ],
    bookings: [
      {
        id: 'booking-1',
        guestName: 'John Doe',
        checkIn: '2025-06-01',
        checkOut: '2025-06-05',
        nights: 4,
        status: 'CONFIRMED',
        roomId: 'room-1',
        roomName: 'Room 101',
        roomTypeId: 'type-1',
        roomTypeName: 'Standard',
        source: 'Direct',
        totalAmount: 500,
      },
      {
        id: 'booking-2',
        guestName: 'Jane Smith',
        checkIn: '2025-06-02',
        checkOut: '2025-06-04',
        nights: 2,
        status: 'PENDING',
        roomId: 'room-2',
        roomName: 'Room 102',
        roomTypeId: 'type-1',
        roomTypeName: 'Standard',
        source: 'Booking.com',
        totalAmount: 300,
      },
    ],
    onBookingClick: mockOnBookingClick,
    onBookingDrag: mockOnBookingDrag,
    onRoomChange: mockOnRoomChange,
  };
  
  const renderWithDnd = (ui: React.ReactElement) => {
    return customRender(
      <DndProvider backend={HTML5Backend}>
        {ui}
      </DndProvider>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders loading spinner when isLoading is true', () => {
    renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
        isLoading={true}
      />
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-calendar')).not.toBeInTheDocument();
  });
  
  it('renders calendar with rooms and bookings when not loading', () => {
    renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
      />
    );
    
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
    
    // Check if all rooms are rendered
    expect(screen.getByTestId('resource-room-1')).toBeInTheDocument();
    expect(screen.getByTestId('resource-room-2')).toBeInTheDocument();
    expect(screen.getByTestId('resource-room-3')).toBeInTheDocument();
    
    // Check if all bookings are rendered
    expect(screen.getByTestId('event-booking-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-booking-2')).toBeInTheDocument();
  });
  
  it('formats bookings correctly for the calendar', () => {
    renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
      />
    );
    
    // Check if BookingBlock components are rendered with correct data
    expect(screen.getByTestId('booking-block-booking-1')).toBeInTheDocument();
    expect(screen.getByText('John Doe - Room 101')).toBeInTheDocument();
    
    expect(screen.getByTestId('booking-block-booking-2')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith - Room 102')).toBeInTheDocument();
  });
  
  it('calls onBookingClick when a booking is clicked', async () => {
    const { user } = renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
      />
    );
    
    const bookingBlock = screen.getByTestId('booking-block-booking-1');
    await user.click(bookingBlock);
    
    expect(mockOnBookingClick).toHaveBeenCalledTimes(1);
    expect(mockOnBookingClick).toHaveBeenCalledWith(defaultProps.bookings[0]);
  });
  
  it('applies correct CSS classes to the calendar', () => {
    renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
      />
    );
    
    const calendar = screen.getByTestId('mock-calendar');
    expect(calendar).toHaveClass('calendar-timeline');
  });
  
  it('handles different view modes correctly', () => {
    // Test week view
    renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
        viewMode="week"
      />
    );
    
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
    
    // Test month view
    renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
        viewMode="month"
      />
    );
    
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
  });
  
  it('handles empty bookings array', () => {
    renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
        bookings={[]}
      />
    );
    
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
    expect(screen.queryByTestId('event-booking-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('event-booking-2')).not.toBeInTheDocument();
  });
  
  it('handles empty rooms array', () => {
    renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
        rooms={[]}
      />
    );
    
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
    expect(screen.queryByTestId('resource-room-1')).not.toBeInTheDocument();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = renderWithDnd(
      <TimelineGrid 
        {...defaultProps}
      />
    );
    
    await checkAccessibility(container);
  });
});
