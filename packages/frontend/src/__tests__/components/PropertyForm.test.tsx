import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { PropertiesProvider } from '../../contexts/PropertiesContext';
import PropertyForm from '../../components/Properties/PropertyForm';

// Mock the API client
jest.mock('../../api/axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { id: 'new-property-id' } })),
  put: jest.fn(() => Promise.resolve({ data: { id: 'existing-property-id' } })),
}));

// Mock useParams and useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
  useNavigate: () => jest.fn(),
}));

const renderWithProviders = (ui) => {
  return render(
    <PropertiesProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </PropertiesProvider>
  );
};

describe('PropertyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders property form with correct title for new property', () => {
    renderWithProviders(<PropertyForm />);
    expect(screen.getByText('Add New Property')).toBeInTheDocument();
  });

  test('form has required input fields', () => {
    renderWithProviders(<PropertyForm />);
    expect(screen.getByLabelText(/Property Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  test('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<PropertyForm />);
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByText('Create Property'));
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/Property name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Location is required/i)).toBeInTheDocument();
    });
  });

  test('allows filling out the form', () => {
    renderWithProviders(<PropertyForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Property Name/i), {
      target: { value: 'Test Property' },
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: 'Test Location' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test Description' },
    });
    
    // Check if values are set correctly
    expect(screen.getByLabelText(/Property Name/i)).toHaveValue('Test Property');
    expect(screen.getByLabelText(/Location/i)).toHaveValue('Test Location');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Test Description');
  });
});
