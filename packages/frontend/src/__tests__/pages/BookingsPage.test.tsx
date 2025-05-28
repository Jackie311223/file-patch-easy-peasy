import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { BookingsProvider } from '../../contexts/BookingsContext';
import { PropertiesProvider } from '../../contexts/PropertiesContext';
import { RoomTypesProvider } from '../../contexts/RoomTypesContext';
import BookingsPage from '../../pages/Bookings/BookingsPage';

// Mock the API client
jest.mock('../../api/axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
}));

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    propertyId: 'test-property-id',
  }),
}));

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

describe('BookingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders bookings page with loading state initially', () => {
    renderWithProviders(<BookingsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('displays empty state when no bookings are found', async () => {
    renderWithProviders(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText(/No bookings found/i)).toBeInTheDocument();
    });
  });

  test('displays "Add Booking" button', async () => {
    renderWithProviders(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Add Booking')).toBeInTheDocument();
    });
  });

  test('displays status filter dropdown', async () => {
    renderWithProviders(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Filter by Status:')).toBeInTheDocument();
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });
  });
});
