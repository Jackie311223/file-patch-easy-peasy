import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { customRender, checkAccessibility, resizeScreenSize, screenSizes, checkFormAccessibility } from '../../test/helpers/test-utils';
import BookingModal from '../components/BookingModal';
import * as bookingsApi from '../../../api/bookingsApi';
import * as roomsApi from '../../../api/roomsApi';

// Mock API calls
jest.mock('../../../api/bookingsApi');
jest.mock('../../../api/roomsApi');

describe('BookingModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    bookingId: 'booking-123',
  };
  
  const mockBooking = {
    id: 'booking-123',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    checkIn: '2025-06-01',
    checkOut: '2025-06-05',
    nights: 4,
    adults: 2,
    children: 1,
    status: 'CONFIRMED',
    roomId: 'room-1',
    roomName: 'Room 101',
    roomTypeId: 'type-1',
    roomTypeName: 'Standard',
    source: 'Direct',
    totalAmount: 500,
    notes: 'Early check-in requested',
    property: {
      id: 'property-1',
      name: 'Test Hotel',
    },
  };
  
  const mockRooms = [
    { id: 'room-1', name: 'Room 101', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'OCCUPIED' },
    { id: 'room-2', name: 'Room 102', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
    { id: 'room-3', name: 'Room 201', roomTypeId: 'type-2', roomTypeName: 'Deluxe', status: 'AVAILABLE' },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    (bookingsApi.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
    (roomsApi.getAvailableRooms as jest.Mock).mockResolvedValue(mockRooms);
    (bookingsApi.updateBookingDates as jest.Mock).mockResolvedValue({ success: true });
    (bookingsApi.assignRoom as jest.Mock).mockResolvedValue({ success: true });
  });
  
  it('renders booking details correctly', async () => {
    customRender(<BookingModal {...defaultProps} />);
    
    // Check modal title
    expect(screen.getByText('Booking Details')).toBeInTheDocument();
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Check guest information
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    
    // Check booking details
    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('June 1, 2025')).toBeInTheDocument(); // Check-in date
    expect(screen.getByText('June 5, 2025')).toBeInTheDocument(); // Check-out date
    expect(screen.getByText('4 nights')).toBeInTheDocument();
    expect(screen.getByText('2 adults, 1 child')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('Early check-in requested')).toBeInTheDocument();
    
    // Check status badge
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit Dates/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Room/i })).toBeInTheDocument();
  });
  
  it('opens edit dates form when Edit Dates button is clicked', async () => {
    const { user } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Click Edit Dates button
    const editDatesButton = screen.getByRole('button', { name: /Edit Dates/i });
    await user.click(editDatesButton);
    
    // Check if date inputs are visible
    expect(screen.getByLabelText(/Check-in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Check-out/i)).toBeInTheDocument();
    
    // Check if Save and Cancel buttons are visible
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });
  
  it('updates booking dates when form is submitted', async () => {
    const { user } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Click Edit Dates button
    const editDatesButton = screen.getByRole('button', { name: /Edit Dates/i });
    await user.click(editDatesButton);
    
    // Change dates
    const checkInInput = screen.getByLabelText(/Check-in/i);
    const checkOutInput = screen.getByLabelText(/Check-out/i);
    
    await user.clear(checkInInput);
    await user.type(checkInInput, '2025-06-10');
    
    await user.clear(checkOutInput);
    await user.type(checkOutInput, '2025-06-15');
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Check API call
    await waitFor(() => {
      expect(bookingsApi.updateBookingDates).toHaveBeenCalledWith('booking-123', {
        checkIn: '2025-06-10',
        checkOut: '2025-06-15',
      });
    });
    
    // Check success message
    expect(screen.getByText(/Booking dates updated successfully/i)).toBeInTheDocument();
    
    // Check if form is closed and we're back to view mode
    expect(screen.queryByLabelText(/Check-in/i)).not.toBeInTheDocument();
    expect(screen.getByText('June 10, 2025')).toBeInTheDocument(); // Updated check-in date
    expect(screen.getByText('June 15, 2025')).toBeInTheDocument(); // Updated check-out date
  });
  
  it('opens change room form when Change Room button is clicked', async () => {
    const { user } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Click Change Room button
    const changeRoomButton = screen.getByRole('button', { name: /Change Room/i });
    await user.click(changeRoomButton);
    
    // Check if room select is visible
    expect(screen.getByLabelText(/Select Room/i)).toBeInTheDocument();
    
    // Check if available rooms are loaded
    await waitFor(() => {
      expect(roomsApi.getAvailableRooms).toHaveBeenCalled();
    });
    
    // Check if room options are displayed
    expect(screen.getByText('Room 102 (Standard)')).toBeInTheDocument();
    expect(screen.getByText('Room 201 (Deluxe)')).toBeInTheDocument();
    
    // Current room should not be in the list or should be disabled
    const roomSelect = screen.getByLabelText(/Select Room/i);
    expect(roomSelect).not.toHaveTextContent('Room 101');
  });
  
  it('assigns new room when form is submitted', async () => {
    const { user } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Click Change Room button
    const changeRoomButton = screen.getByRole('button', { name: /Change Room/i });
    await user.click(changeRoomButton);
    
    // Wait for available rooms to load
    await waitFor(() => {
      expect(roomsApi.getAvailableRooms).toHaveBeenCalled();
    });
    
    // Select a new room
    const roomSelect = screen.getByLabelText(/Select Room/i);
    await user.click(roomSelect);
    const roomOption = screen.getByText('Room 201 (Deluxe)');
    await user.click(roomOption);
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Check API call
    await waitFor(() => {
      expect(bookingsApi.assignRoom).toHaveBeenCalledWith({
        bookingId: 'booking-123',
        roomId: 'room-3', // ID of Room 201
      });
    });
    
    // Check success message
    expect(screen.getByText(/Room assigned successfully/i)).toBeInTheDocument();
    
    // Check if form is closed and we're back to view mode with updated room
    expect(screen.queryByLabelText(/Select Room/i)).not.toBeInTheDocument();
    expect(screen.getByText('Room 201')).toBeInTheDocument(); // Updated room
    expect(screen.getByText('Deluxe')).toBeInTheDocument(); // Updated room type
  });
  
  it('handles API errors gracefully', async () => {
    // Mock API error
    (bookingsApi.updateBookingDates as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { user } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Click Edit Dates button
    const editDatesButton = screen.getByRole('button', { name: /Edit Dates/i });
    await user.click(editDatesButton);
    
    // Change dates
    const checkInInput = screen.getByLabelText(/Check-in/i);
    const checkOutInput = screen.getByLabelText(/Check-out/i);
    
    await user.clear(checkInInput);
    await user.type(checkInInput, '2025-06-10');
    
    await user.clear(checkOutInput);
    await user.type(checkOutInput, '2025-06-15');
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to update booking dates/i)).toBeInTheDocument();
    });
    
    // Form should still be open
    expect(screen.getByLabelText(/Check-in/i)).toBeInTheDocument();
  });
  
  it('validates date inputs', async () => {
    const { user } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Click Edit Dates button
    const editDatesButton = screen.getByRole('button', { name: /Edit Dates/i });
    await user.click(editDatesButton);
    
    // Enter invalid dates (check-out before check-in)
    const checkInInput = screen.getByLabelText(/Check-in/i);
    const checkOutInput = screen.getByLabelText(/Check-out/i);
    
    await user.clear(checkInInput);
    await user.type(checkInInput, '2025-06-10');
    
    await user.clear(checkOutInput);
    await user.type(checkOutInput, '2025-06-05'); // Before check-in
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Check validation error
    expect(screen.getByText(/Check-out date must be after check-in date/i)).toBeInTheDocument();
    
    // API should not be called
    expect(bookingsApi.updateBookingDates).not.toHaveBeenCalled();
  });
  
  it('closes modal when Close button is clicked', async () => {
    const { user } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Click Close button
    const closeButton = screen.getByRole('button', { name: /Close/i });
    await user.click(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Check accessibility
    await checkAccessibility(container);
    
    // Check modal accessibility
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    
    // Check form accessibility when in edit mode
    const { user } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Click Edit Dates button
    const editDatesButton = screen.getByRole('button', { name: /Edit Dates/i });
    await user.click(editDatesButton);
    
    // Check form accessibility
    const form = container.querySelector('form');
    if (form) {
      checkFormAccessibility(form);
    }
  });
  
  it('is responsive on different screen sizes', async () => {
    const { container } = customRender(<BookingModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Test on mobile
    resizeScreenSize(screenSizes.mobile.width, screenSizes.mobile.height);
    
    // Check if layout adapts (specific checks depend on your responsive design)
    const modalContent = container.querySelector('[data-testid="modal-content"]');
    const computedStyle = window.getComputedStyle(modalContent as Element);
    
    // On mobile, width should be close to viewport width
    expect(parseInt(computedStyle.width)).toBeLessThanOrEqual(screenSizes.mobile.width);
    
    // Test on desktop
    resizeScreenSize(screenSizes.desktop.width, screenSizes.desktop.height);
    
    // Modal should not be full width on desktop
    const updatedStyle = window.getComputedStyle(modalContent as Element);
    expect(parseInt(updatedStyle.width)).toBeLessThan(screenSizes.desktop.width);
  });
  
  it('handles different user roles correctly', async () => {
    // Render as STAFF (limited permissions)
    customRender(
      <BookingModal {...defaultProps} />,
      { userRole: 'STAFF' }
    );
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Edit buttons should not be present for STAFF
    expect(screen.queryByRole('button', { name: /Edit Dates/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Change Room/i })).not.toBeInTheDocument();
    
    // Only Close button should be available
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });
});
