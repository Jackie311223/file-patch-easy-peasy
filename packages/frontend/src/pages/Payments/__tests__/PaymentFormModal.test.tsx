import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { customRender, checkAccessibility, mockAuthContextValues } from '../../test/helpers/test-utils';
import PaymentFormModal from '../components/PaymentFormModal';
import * as paymentsApi from '../../../api/paymentsApi';
import * as bookingsApi from '../../../api/bookingsApi';

// Mock API calls
jest.mock('../../../api/paymentsApi');
jest.mock('../../../api/bookingsApi');

describe('PaymentFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    bookingId: 'booking-123',
    paymentId: undefined, // For create mode
  };
  
  const mockBooking = {
    id: 'booking-123',
    guestName: 'John Doe',
    checkIn: '2025-06-01',
    checkOut: '2025-06-05',
    totalAmount: 1000,
    property: {
      id: 'property-1',
      name: 'Test Hotel',
    },
  };
  
  const mockPayment = {
    id: 'payment-123',
    amount: 500,
    method: 'CREDIT_CARD',
    status: 'COMPLETED',
    type: 'HOTEL_COLLECT',
    bookingId: 'booking-123',
    collectedBy: 'user-123',
    paymentDate: '2025-06-01',
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    (bookingsApi.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
    (paymentsApi.getPaymentById as jest.Mock).mockResolvedValue(mockPayment);
    (paymentsApi.createPayment as jest.Mock).mockResolvedValue({ id: 'new-payment-id' });
    (paymentsApi.updatePayment as jest.Mock).mockResolvedValue({ id: 'payment-123' });
  });
  
  it('renders correctly in create mode', async () => {
    customRender(<PaymentFormModal {...defaultProps} />);
    
    // Check modal title
    expect(screen.getByText('New Payment')).toBeInTheDocument();
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Check booking info is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Date/i)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });
  
  it('renders correctly in edit mode', async () => {
    customRender(<PaymentFormModal {...defaultProps} paymentId="payment-123" />);
    
    // Check modal title
    expect(screen.getByText('Edit Payment')).toBeInTheDocument();
    
    // Wait for payment data to load
    await waitFor(() => {
      expect(paymentsApi.getPaymentById).toHaveBeenCalledWith('payment-123');
    });
    
    // Check form is pre-filled with payment data
    const amountInput = screen.getByLabelText(/Amount/i) as HTMLInputElement;
    expect(amountInput.value).toBe('500');
    
    // Check method is selected
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });
  
  it('dynamically changes fields based on payment type selection', async () => {
    const { user } = customRender(<PaymentFormModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Initially should show HOTEL_COLLECT fields
    expect(screen.getByLabelText(/Collected By/i)).toBeInTheDocument();
    
    // Change payment type to OTA_COLLECT
    const typeSelect = screen.getByLabelText(/Payment Type/i);
    await user.click(typeSelect);
    const otaOption = screen.getByText('OTA Collect');
    await user.click(otaOption);
    
    // Should now show OTA_COLLECT fields
    expect(screen.getByLabelText(/Received From/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Collected By/i)).not.toBeInTheDocument();
  });
  
  it('validates OTA payment date against checkout date', async () => {
    const { user } = customRender(<PaymentFormModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Change payment type to OTA_COLLECT
    const typeSelect = screen.getByLabelText(/Payment Type/i);
    await user.click(typeSelect);
    const otaOption = screen.getByText('OTA Collect');
    await user.click(otaOption);
    
    // Enter an invalid date (before checkout)
    const dateInput = screen.getByLabelText(/Payment Date/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2025-06-01'); // Before checkout (2025-06-05)
    
    // Try to submit the form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Should show validation error
    expect(screen.getByText(/Payment date must be after checkout date/i)).toBeInTheDocument();
    
    // API should not be called
    expect(paymentsApi.createPayment).not.toHaveBeenCalled();
  });
  
  it('submits form with correct data for HOTEL_COLLECT payment', async () => {
    const { user } = customRender(<PaymentFormModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Fill form
    const amountInput = screen.getByLabelText(/Amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '750');
    
    // Select payment method
    const methodSelect = screen.getByLabelText(/Payment Method/i);
    await user.click(methodSelect);
    const cashOption = screen.getByText('Cash');
    await user.click(cashOption);
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Check API call
    await waitFor(() => {
      expect(paymentsApi.createPayment).toHaveBeenCalledWith(expect.objectContaining({
        amount: 750,
        method: 'CASH',
        type: 'HOTEL_COLLECT',
        bookingId: 'booking-123',
      }));
    });
    
    // Check onSuccess callback
    expect(mockOnSuccess).toHaveBeenCalled();
    
    // Check modal closed
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('submits form with correct data for OTA_COLLECT payment', async () => {
    const { user } = customRender(<PaymentFormModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Fill form
    const amountInput = screen.getByLabelText(/Amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '750');
    
    // Change payment type to OTA_COLLECT
    const typeSelect = screen.getByLabelText(/Payment Type/i);
    await user.click(typeSelect);
    const otaOption = screen.getByText('OTA Collect');
    await user.click(otaOption);
    
    // Fill OTA-specific fields
    const receivedFromInput = screen.getByLabelText(/Received From/i);
    await user.type(receivedFromInput, 'Booking.com');
    
    // Enter a valid date (after checkout)
    const dateInput = screen.getByLabelText(/Payment Date/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2025-06-10'); // After checkout (2025-06-05)
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Check API call
    await waitFor(() => {
      expect(paymentsApi.createPayment).toHaveBeenCalledWith(expect.objectContaining({
        amount: 750,
        type: 'OTA_COLLECT',
        receivedFrom: 'Booking.com',
        paymentDate: expect.stringContaining('2025-06-10'),
        bookingId: 'booking-123',
      }));
    });
  });
  
  it('handles API errors gracefully', async () => {
    // Mock API error
    (paymentsApi.createPayment as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { user } = customRender(<PaymentFormModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Fill form with minimal data
    const amountInput = screen.getByLabelText(/Amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '500');
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to save payment/i)).toBeInTheDocument();
    });
    
    // Modal should remain open
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('closes modal when cancel button is clicked', async () => {
    const { user } = customRender(<PaymentFormModal {...defaultProps} />);
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    // Check modal closed
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = customRender(<PaymentFormModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Check accessibility
    await checkAccessibility(container);
  });
  
  it('disables form submission when required fields are missing', async () => {
    const { user } = customRender(<PaymentFormModal {...defaultProps} />);
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Clear amount field
    const amountInput = screen.getByLabelText(/Amount/i);
    await user.clear(amountInput);
    
    // Submit button should be disabled
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeDisabled();
    
    // Fill amount
    await user.type(amountInput, '500');
    
    // Submit button should be enabled
    expect(saveButton).not.toBeDisabled();
  });
  
  it('shows loading state during API calls', async () => {
    // Delay API response
    (bookingsApi.getBookingById as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockBooking), 100);
      });
    });
    
    customRender(<PaymentFormModal {...defaultProps} />);
    
    // Should show loading state
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });
  
  it('handles different user roles correctly', async () => {
    // Render as STAFF (limited permissions)
    const { user } = customRender(
      <PaymentFormModal {...defaultProps} />,
      { userRole: 'STAFF' }
    );
    
    // Wait for booking data to load
    await waitFor(() => {
      expect(bookingsApi.getBookingById).toHaveBeenCalledWith('booking-123');
    });
    
    // Form should be in read-only mode for STAFF
    const amountInput = screen.getByLabelText(/Amount/i) as HTMLInputElement;
    expect(amountInput.readOnly).toBe(true);
    
    // Save button should not be present
    expect(screen.queryByRole('button', { name: /Save/i })).not.toBeInTheDocument();
    
    // Only close button should be available
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });
});
