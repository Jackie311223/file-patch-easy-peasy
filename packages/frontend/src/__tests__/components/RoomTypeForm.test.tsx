import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { RoomTypesProvider } from '../../contexts/RoomTypesContext';
import { PropertiesProvider } from '../../contexts/PropertiesContext';
import RoomTypeForm from '../../components/RoomTypes/RoomTypeForm';

// Mock the API client
jest.mock('../../api/axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { id: 'new-roomtype-id' } })),
  put: jest.fn(() => Promise.resolve({ data: { id: 'existing-roomtype-id' } })),
  get: jest.fn(() => Promise.resolve({ data: { id: 'test-property-id', name: 'Test Property' } })),
}));

// Mock useParams and useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    propertyId: 'test-property-id',
  }),
  useNavigate: () => jest.fn(),
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

describe('RoomTypeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders room type form with correct title for new room type', async () => {
    renderWithProviders(<RoomTypeForm />);
    await waitFor(() => {
      expect(screen.getByText(/Add New Room Type/i)).toBeInTheDocument();
    });
  });

  test('form has required input fields', async () => {
    renderWithProviders(<RoomTypeForm />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Room Type Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Occupancy/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Price per Night/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
    });
  });

  test('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<RoomTypeForm />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText(/Add New Room Type/i)).toBeInTheDocument();
    });
    
    // Submit the form without filling required fields
    fireEvent.click(screen.getByText(/Create Room Type/i));
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/Room type name is required/i)).toBeInTheDocument();
    });
  });

  test('allows filling out the form', async () => {
    renderWithProviders(<RoomTypeForm />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText(/Add New Room Type/i)).toBeInTheDocument();
    });
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Room Type Name/i), {
      target: { value: 'Deluxe Room' },
    });
    fireEvent.change(screen.getByLabelText(/Occupancy/i), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/Price per Night/i), {
      target: { value: '150' },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: '5' },
    });
    
    // Check if values are set correctly
    expect(screen.getByLabelText(/Room Type Name/i)).toHaveValue('Deluxe Room');
    expect(screen.getByLabelText(/Occupancy/i)).toHaveValue(2);
    expect(screen.getByLabelText(/Price per Night/i)).toHaveValue(150);
    expect(screen.getByLabelText(/Quantity/i)).toHaveValue(5);
  });
});
