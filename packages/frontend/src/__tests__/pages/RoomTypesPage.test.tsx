import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { RoomTypesProvider } from '../../contexts/RoomTypesContext';
import { PropertiesProvider } from '../../contexts/PropertiesContext';
import RoomTypesPage from '../../pages/RoomTypes/RoomTypesPage';

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
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </RoomTypesProvider>
    </PropertiesProvider>
  );
};

describe('RoomTypesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders room types page with loading state initially', () => {
    renderWithProviders(<RoomTypesPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('displays empty state when no room types are found', async () => {
    renderWithProviders(<RoomTypesPage />);
    await waitFor(() => {
      expect(screen.getByText(/No room types have been added/i)).toBeInTheDocument();
    });
  });

  test('displays "Add Room Type" button', async () => {
    renderWithProviders(<RoomTypesPage />);
    await waitFor(() => {
      expect(screen.getByText('Add Room Type')).toBeInTheDocument();
    });
  });
});
