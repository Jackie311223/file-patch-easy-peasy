import React from 'react';
import { screen } from '@testing-library/react';
import { customRender, checkAccessibility } from '../../../test/helpers/test-utils';
import BookingPopover from '../components/BookingPopover';

describe('BookingPopover', () => {
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
    adults: 2,
    children: 1,
    isVIP: false,
  };
  
  it('renders booking information correctly', () => {
    customRender(<BookingPopover booking={defaultBooking} />);
    
    // Check guest name
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check dates
    expect(screen.getByText('Sun, Jun 1, 2025')).toBeInTheDocument();
    expect(screen.getByText('Thu, Jun 5, 2025')).toBeInTheDocument();
    
    // Check nights
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Check room info
    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    
    // Check guests
    expect(screen.getByText('2 Adults, 1 Children')).toBeInTheDocument();
    
    // Check source
    expect(screen.getByText('Direct')).toBeInTheDocument();
    
    // Check total amount
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    
    // Check notes
    expect(screen.getByText('Early check-in requested')).toBeInTheDocument();
    
    // Check help text
    expect(screen.getByText('Click to edit booking details')).toBeInTheDocument();
  });
  
  it('shows VIP indicator for VIP guests', () => {
    customRender(<BookingPopover booking={{ ...defaultBooking, isVIP: true }} />);
    
    const vipIndicator = screen.getByText('⭐');
    expect(vipIndicator).toBeInTheDocument();
    expect(vipIndicator).toHaveClass('text-yellow-500');
  });
  
  it('does not show VIP indicator for regular guests', () => {
    customRender(<BookingPopover booking={defaultBooking} />);
    
    expect(screen.queryByText('⭐')).not.toBeInTheDocument();
  });
  
  it('applies correct status badge styles', () => {
    const statuses = [
      { status: 'CONFIRMED', className: 'bg-green-100 text-green-800' },
      { status: 'PENDING', className: 'bg-amber-100 text-amber-800' },
      { status: 'CANCELLED', className: 'bg-red-100 text-red-800' },
      { status: 'CHECKED_IN', className: 'bg-blue-100 text-blue-800' },
      { status: 'CHECKED_OUT', className: 'bg-purple-100 text-purple-800' },
      { status: 'NO_SHOW', className: 'bg-gray-100 text-gray-800' },
      { status: 'UNKNOWN', className: 'bg-gray-100 text-gray-800' }, // Default case
    ];
    
    statuses.forEach(({ status, className }) => {
      const { container } = customRender(
        <BookingPopover booking={{ ...defaultBooking, status }} />
      );
      
      const statusBadge = screen.getByText(status);
      expect(statusBadge).toHaveClass(className);
    });
  });
  
  it('handles singular/plural for guests correctly', () => {
    // Test with 1 adult, 0 children
    customRender(
      <BookingPopover booking={{ ...defaultBooking, adults: 1, children: 0 }} />
    );
    expect(screen.getByText('1 Adult, 0 Children')).toBeInTheDocument();
    
    // Test with 0 adults, 1 child
    customRender(
      <BookingPopover booking={{ ...defaultBooking, adults: 0, children: 1 }} />
    );
    expect(screen.getByText('0 Adults, 1 Child')).toBeInTheDocument();
  });
  
  it('does not show guests section when adults and children are undefined', () => {
    const bookingWithoutGuests = { ...defaultBooking };
    delete bookingWithoutGuests.adults;
    delete bookingWithoutGuests.children;
    
    customRender(<BookingPopover booking={bookingWithoutGuests} />);
    
    expect(screen.queryByText('Guests:')).not.toBeInTheDocument();
  });
  
  it('does not show notes section when notes is undefined', () => {
    const bookingWithoutNotes = { ...defaultBooking, notes: undefined };
    
    customRender(<BookingPopover booking={bookingWithoutNotes} />);
    
    expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
  });
  
  it('formats currency correctly', () => {
    // Test with different amounts
    customRender(<BookingPopover booking={{ ...defaultBooking, totalAmount: 1234.56 }} />);
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    
    customRender(<BookingPopover booking={{ ...defaultBooking, totalAmount: 0 }} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = customRender(<BookingPopover booking={defaultBooking} />);
    await checkAccessibility(container);
  });
});
