import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { customRender, checkAccessibility } from '../../test/helpers/test-utils';
import InvoiceCreateModal from '../components/InvoiceCreateModal';
import * as invoicesApi from '../../../api/invoicesApi';
import * as paymentsApi from '../../../api/paymentsApi';

// Mock API calls
jest.mock('../../../api/invoicesApi');
jest.mock('../../../api/paymentsApi');

describe('InvoiceCreateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };
  
  const mockPayments = [
    {
      id: 'payment-1',
      amount: 500,
      method: 'CREDIT_CARD',
      status: 'COMPLETED',
      type: 'OTA_COLLECT',
      bookingId: 'booking-1',
      receivedFrom: 'Booking.com',
      paymentDate: '2025-06-10',
      booking: {
        id: 'booking-1',
        guestName: 'John Doe',
        property: { name: 'Hotel A' },
      },
    },
    {
      id: 'payment-2',
      amount: 750,
      method: 'BANK_TRANSFER',
      status: 'COMPLETED',
      type: 'OTA_COLLECT',
      bookingId: 'booking-2',
      receivedFrom: 'Expedia',
      paymentDate: '2025-06-15',
      booking: {
        id: 'booking-2',
        guestName: 'Jane Smith',
        property: { name: 'Hotel A' },
      },
    },
    {
      id: 'payment-3',
      amount: 300,
      method: 'CREDIT_CARD',
      status: 'PENDING',
      type: 'OTA_COLLECT',
      bookingId: 'booking-3',
      receivedFrom: 'Airbnb',
      paymentDate: '2025-06-20',
      booking: {
        id: 'booking-3',
        guestName: 'Bob Johnson',
        property: { name: 'Hotel B' },
      },
    },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    (paymentsApi.getOtaPayments as jest.Mock).mockResolvedValue(mockPayments);
    (invoicesApi.createInvoice as jest.Mock).mockResolvedValue({ id: 'new-invoice-id' });
  });
  
  it('renders correctly with payment list', async () => {
    customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Check modal title
    expect(screen.getByText('Create Invoice')).toBeInTheDocument();
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Check payment list is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    
    // Check payment amounts
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$750.00')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
    
    // Check OTA sources
    expect(screen.getByText('Booking.com')).toBeInTheDocument();
    expect(screen.getByText('Expedia')).toBeInTheDocument();
    expect(screen.getByText('Airbnb')).toBeInTheDocument();
    
    // Check checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3);
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Invoice/i })).toBeInTheDocument();
  });
  
  it('filters out pending payments', async () => {
    customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Check that pending payment is disabled or has warning
    const pendingPaymentRow = screen.getByText('Bob Johnson').closest('tr');
    expect(pendingPaymentRow).toHaveClass('opacity-50');
    
    // The checkbox should be disabled
    const checkbox = within(pendingPaymentRow as HTMLElement).getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });
  
  it('allows selecting multiple payments', async () => {
    const { user } = customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Get checkboxes for completed payments
    const checkboxes = screen.getAllByRole('checkbox');
    const enabledCheckboxes = checkboxes.filter(checkbox => !checkbox.hasAttribute('disabled'));
    
    // Select first payment
    await user.click(enabledCheckboxes[0]);
    
    // Select second payment
    await user.click(enabledCheckboxes[1]);
    
    // Both should be checked
    expect(enabledCheckboxes[0]).toBeChecked();
    expect(enabledCheckboxes[1]).toBeChecked();
    
    // Total amount should be updated
    expect(screen.getByText('Total: $1,250.00')).toBeInTheDocument();
  });
  
  it('creates invoice with selected payments', async () => {
    const { user } = customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Get checkboxes for completed payments
    const checkboxes = screen.getAllByRole('checkbox');
    const enabledCheckboxes = checkboxes.filter(checkbox => !checkbox.hasAttribute('disabled'));
    
    // Select both payments
    await user.click(enabledCheckboxes[0]);
    await user.click(enabledCheckboxes[1]);
    
    // Submit form
    const createButton = screen.getByRole('button', { name: /Create Invoice/i });
    await user.click(createButton);
    
    // Check API call
    await waitFor(() => {
      expect(invoicesApi.createInvoice).toHaveBeenCalledWith({
        paymentIds: ['payment-1', 'payment-2'],
      });
    });
    
    // Check onSuccess callback
    expect(mockOnSuccess).toHaveBeenCalled();
    
    // Check modal closed
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('disables create button when no payments are selected', async () => {
    customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Create button should be disabled
    const createButton = screen.getByRole('button', { name: /Create Invoice/i });
    expect(createButton).toBeDisabled();
  });
  
  it('handles API errors gracefully', async () => {
    // Mock API error
    (invoicesApi.createInvoice as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { user } = customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Select a payment
    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);
    
    // Submit form
    const createButton = screen.getByRole('button', { name: /Create Invoice/i });
    await user.click(createButton);
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to create invoice/i)).toBeInTheDocument();
    });
    
    // Modal should remain open
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('closes modal when cancel button is clicked', async () => {
    const { user } = customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    // Check modal closed
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('shows empty state when no OTA payments are available', async () => {
    // Mock empty payments list
    (paymentsApi.getOtaPayments as jest.Mock).mockResolvedValue([]);
    
    customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Should show empty state
    expect(screen.getByText(/No OTA payments available/i)).toBeInTheDocument();
    
    // Create button should be disabled
    const createButton = screen.getByRole('button', { name: /Create Invoice/i });
    expect(createButton).toBeDisabled();
  });
  
  it('shows loading state during API calls', async () => {
    // Delay API response
    (paymentsApi.getOtaPayments as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockPayments), 100);
      });
    });
    
    customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Should show loading state
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    
    // Wait for payments to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });
  
  it('has no accessibility violations', async () => {
    const { container } = customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Check accessibility
    await checkAccessibility(container);
  });
  
  it('filters payments by OTA source', async () => {
    const { user } = customRender(<InvoiceCreateModal {...defaultProps} />);
    
    // Wait for payments to load
    await waitFor(() => {
      expect(paymentsApi.getOtaPayments).toHaveBeenCalled();
    });
    
    // Find filter input
    const filterInput = screen.getByPlaceholderText(/Filter by OTA/i);
    
    // Filter by "Booking"
    await user.type(filterInput, 'Booking');
    
    // Should only show Booking.com payment
    expect(screen.getByText('Booking.com')).toBeInTheDocument();
    expect(screen.queryByText('Expedia')).not.toBeInTheDocument();
    expect(screen.queryByText('Airbnb')).not.toBeInTheDocument();
    
    // Clear filter
    await user.clear(filterInput);
    
    // Should show all payments again
    expect(screen.getByText('Booking.com')).toBeInTheDocument();
    expect(screen.getByText('Expedia')).toBeInTheDocument();
    expect(screen.getByText('Airbnb')).toBeInTheDocument();
  });
});
