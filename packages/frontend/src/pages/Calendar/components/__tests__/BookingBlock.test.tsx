import React from 'react';
import { screen } from '@testing-library/react';
import { customRender, checkAccessibility } from '../../../test/helpers/test-utils';
import BookingBlock from '../components/BookingBlock';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Mock BookingPopover since we're testing BookingBlock in isolation
jest.mock('../components/BookingPopover', () => {
  return function MockBookingPopover() {
    return <div data-testid="booking-popover">Booking Popover Content</div>;
  };
});

describe('BookingBlock', () => {
  const mockOnClick = jest.fn();
  const mockOnDrag = jest.fn();
  const mockOnRoomChange = jest.fn();
  
  const defaultBooking = {
    id: 'booking-123',
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
    notes: 'Early check-in requested',
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
  
  it('renders booking information correctly', () => {
    renderWithDnd(
      <BookingBlock 
        booking={defaultBooking}
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    // Check guest name
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check dates
    expect(screen.getByText('Jun 1 - Jun 5')).toBeInTheDocument();
    
    // Check nights
    expect(screen.getByText('4 nights')).toBeInTheDocument();
    
    // Check room name
    expect(screen.getByText('Room 101')).toBeInTheDocument();
    
    // Check source
    expect(screen.getByText('Direct')).toBeInTheDocument();
    
    // Check notes
    expect(screen.getByText(/Early check-in requested/)).toBeInTheDocument();
  });
  
  it('applies correct color based on booking status', () => {
    const statuses = [
      { status: 'CONFIRMED', className: 'bg-green-100 border-green-500' },
      { status: 'PENDING', className: 'bg-amber-100 border-amber-500' },
      { status: 'CANCELLED', className: 'bg-red-100 border-red-500' },
      { status: 'CHECKED_IN', className: 'bg-blue-100 border-blue-500' },
      { status: 'CHECKED_OUT', className: 'bg-purple-100 border-purple-500' },
      { status: 'NO_SHOW', className: 'bg-gray-100 border-gray-500' },
      { status: 'UNKNOWN', className: 'bg-gray-100 border-gray-500' }, // Default case
    ];
    
    statuses.forEach(({ status, className }) => {
      const { container } = renderWithDnd(
        <BookingBlock 
          booking={{ ...defaultBooking, status }}
          onClick={mockOnClick}
          onDrag={mockOnDrag}
          onRoomChange={mockOnRoomChange}
        />
      );
      
      const bookingBlock = container.querySelector('.booking-block');
      expect(bookingBlock).toHaveClass(className);
    });
  });
  
  it('shows VIP indicator for VIP guests', () => {
    renderWithDnd(
      <BookingBlock 
        booking={{ ...defaultBooking, isVIP: true }}
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    const vipIndicator = screen.getByTitle('VIP Guest');
    expect(vipIndicator).toBeInTheDocument();
    expect(vipIndicator).toHaveTextContent('⭐');
  });
  
  it('does not show VIP indicator for regular guests', () => {
    renderWithDnd(
      <BookingBlock 
        booking={defaultBooking} // No isVIP flag
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    expect(screen.queryByTitle('VIP Guest')).not.toBeInTheDocument();
  });
  
  it('displays singular "night" when booking is for 1 night', () => {
    renderWithDnd(
      <BookingBlock 
        booking={{ ...defaultBooking, nights: 1, checkOut: '2025-06-02' }}
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    expect(screen.getByText('1 night')).toBeInTheDocument();
  });
  
  it('displays plural "nights" when booking is for multiple nights', () => {
    renderWithDnd(
      <BookingBlock 
        booking={{ ...defaultBooking, nights: 3, checkOut: '2025-06-04' }}
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    expect(screen.getByText('3 nights')).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', async () => {
    const { user } = renderWithDnd(
      <BookingBlock 
        booking={defaultBooking}
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    const bookingBlock = screen.getByText('John Doe').closest('.booking-block');
    await user.click(bookingBlock!);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('has no accessibility violations', async () => {
    const { container } = renderWithDnd(
      <BookingBlock 
        booking={defaultBooking}
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    await checkAccessibility(container);
  });
  
  it('handles notes being undefined', () => {
    renderWithDnd(
      <BookingBlock 
        booking={{ ...defaultBooking, notes: undefined }}
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    // Should not render notes section
    expect(screen.queryByText(/📝/)).not.toBeInTheDocument();
  });
  
  it('has proper drag and drop setup', () => {
    const { container } = renderWithDnd(
      <BookingBlock 
        booking={defaultBooking}
        onClick={mockOnClick}
        onDrag={mockOnDrag}
        onRoomChange={mockOnRoomChange}
      />
    );
    
    // Check if the element has drag attributes
    const bookingBlock = container.querySelector('.booking-block');
    expect(bookingBlock).toHaveAttribute('draggable', 'true');
    
    // Check for cursor style indicating draggable
    expect(bookingBlock).toHaveClass('cursor-pointer');
  });
});
