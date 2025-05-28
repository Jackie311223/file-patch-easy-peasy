import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { BookingsProvider } from '../../contexts/BookingsContext';
import { PropertiesProvider } from '../../contexts/PropertiesContext';
import { RoomTypesProvider } from '../../contexts/RoomTypesContext';
import BookingForm from '../../components/Bookings/BookingForm';
import { Booking, Channel, PaymentMethod, PaymentStatus, BookingStatus, DepositMethod, DepositStatus } from '../../types/booking'; // Import Booking type

// Mock the API client
jest.mock('../../api/axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { id: 'new-booking-id' } })),
  put: jest.fn(() => Promise.resolve({ data: { id: 'existing-booking-id' } })),
  get: jest.fn((url) => {
    if (url.includes('/properties') && !url.includes('/room-types')) {
      return Promise.resolve({ data: [{ id: 'prop1', name: 'Property One' }, { id: 'prop2', name: 'Property Two' }] });
    } else if (url.includes('/room-types')) {
      return Promise.resolve({ data: [{ id: 'rt1', name: 'Room Type One', occupancy: 2, price: 100 }, { id: 'rt2', name: 'Room Type Two', occupancy: 4, price: 150 }] });
    }
    return Promise.resolve({ data: {} });
  }),
}));

// Mock hooks
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ search: '' }),
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const renderWithProviders = (ui) => {
  return render(
    <PropertiesProvider>
      <RoomTypesProvider>
        <BookingsProvider>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </BookingsProvider>
      </RoomTypesProvider>
    </PropertiesProvider>
  );
};

// Helper to create a valid Booking object for testing
const createMockBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'test-id',
  guestName: 'Test Guest',
  contactPhone: '1234567890',
  channel: Channel.DIRECT,
  checkIn: new Date('2024-08-01').toISOString(),
  checkOut: new Date('2024-08-05').toISOString(),
  nights: 4,
  adults: 2,
  children: 0,
  totalAmount: 400,
  commission: 40,
  netRevenue: 360,
  currency: 'VND',
  paymentMethod: PaymentMethod.CASH,
  paymentStatus: PaymentStatus.PAID,
  amountPaid: 400,
  outstandingBalance: 0,
  bookingStatus: BookingStatus.CONFIRMED,
  propertyId: 'prop1',
  property: { id: 'prop1', name: 'Property One' }, // Nested property info
  userId: 'user1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // Required field - always provide a default tenantId
  tenantId: 't1',
  // Optional fields set to undefined or null as appropriate
  roomTypeId: 'rt1',
  contactEmail: 'test@example.com',
  reference: 'ref123',
  paymentChannel: undefined,
  refundedAmount: undefined,
  invoiceUrl: undefined,
  assignedStaff: undefined,
  specialRequests: undefined,
  internalNotes: undefined,
  depositAmount: undefined,
  depositDate: undefined,
  depositMethod: undefined,
  depositStatus: undefined,
  ...overrides, // Apply overrides
});

describe('BookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders booking form with correct title for new booking', async () => {
    renderWithProviders(<BookingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await waitFor(() => {
      expect(screen.getByText(/Create New Booking/i)).toBeInTheDocument();
    });
  });

  test('renders booking form with correct title and data for editing booking', async () => {
    // Use the helper to create a valid Booking object
    const initialData = createMockBooking({
      id: 'edit-id',
      guestName: 'Jane Doe',
      contactPhone: '9876543210',
      channel: Channel.BOOKING_COM,
      checkIn: new Date('2024-06-01').toISOString(),
      checkOut: new Date('2024-06-05').toISOString(),
      nights: 4,
      adults: 1,
      children: 1,
      totalAmount: 500,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.PAID,
      amountPaid: 500,
      outstandingBalance: 0,
      bookingStatus: BookingStatus.CONFIRMED,
      propertyId: 'prop1',
      property: { id: 'prop1', name: 'Property One' },
      roomTypeId: 'rt1',
      contactEmail: 'jane@example.com',
      tenantId: 't1', // Explicitly include tenantId even in overrides
    });

    renderWithProviders(<BookingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} initialData={initialData} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Edit Booking/i)).toBeInTheDocument();
      // Check if form fields are populated correctly (using formatted values where needed)
      expect(screen.getByLabelText(/Guest Name/i)).toHaveValue('Jane Doe');
      expect(screen.getByLabelText(/Property \*/i)).toHaveValue('prop1');
      expect(screen.getByLabelText(/Check-in Date \*/i)).toHaveValue('2024-06-01');
      expect(screen.getByLabelText(/Booking Channel \*/i)).toHaveValue(Channel.BOOKING_COM);
      // Add more checks as needed
    });
  });

  test('form has required input fields', async () => {
    renderWithProviders(<BookingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Property \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Guest Name \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact Phone \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Booking Channel \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Check-in Date \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Check-out Date \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Adults \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Total Amount \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Payment Method \*/i)).toBeInTheDocument();
    });
  });

  test('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<BookingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Create New Booking/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create Booking/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Property selection is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Guest name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact phone is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Channel is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Check-in date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Check-out date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/At least one adult is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid total amount/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment method is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with correct data when form is valid', async () => {
    renderWithProviders(<BookingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
        expect(screen.getByText('Property One')).toBeInTheDocument();
    });

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Property \*/i), { target: { value: 'prop1' } });
    await waitFor(() => {
        expect(screen.getByText('Room Type One', { exact: false })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/Room Type/i), { target: { value: 'rt1' } });
    fireEvent.change(screen.getByLabelText(/Guest Name \*/i), { target: { value: 'Test Guest' } });
    fireEvent.change(screen.getByLabelText(/Contact Phone \*/i), { target: { value: '1112223333' } });
    fireEvent.change(screen.getByLabelText(/Booking Channel \*/i), { target: { value: Channel.DIRECT } }); // Use DIRECT
    fireEvent.change(screen.getByLabelText(/Check-in Date \*/i), { target: { value: '2024-07-01' } });
    fireEvent.change(screen.getByLabelText(/Check-out Date \*/i), { target: { value: '2024-07-05' } });
    fireEvent.change(screen.getByLabelText(/Adults \*/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Total Amount \*/i), { target: { value: '400' } });
    fireEvent.change(screen.getByLabelText(/Payment Method \*/i), { target: { value: PaymentMethod.BANK_TRANSFER } });
    fireEvent.change(screen.getByLabelText(/Contact Email/i), { target: { value: 'test@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Booking/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      // Expect BookingFormData structure
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: 'prop1',
          roomTypeId: 'rt1',
          guestName: 'Test Guest',
          contactPhone: '1112223333',
          contactEmail: 'test@test.com',
          channel: Channel.DIRECT, // Check for DIRECT
          checkIn: '2024-07-01',
          checkOut: '2024-07-05',
          adults: 2,
          totalAmount: '400',
          paymentMethod: PaymentMethod.BANK_TRANSFER,
        }),
        undefined // No ID for create
      );
    });
  });

  test('calls onCancel when cancel button is clicked', async () => {
    renderWithProviders(<BookingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await waitFor(() => {
      expect(screen.getByText(/Create New Booking/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
