import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { PropertiesProvider } from '../../contexts/PropertiesContext';
import PropertiesPage from '../../pages/Properties/PropertiesPage';

// Mock the API client
jest.mock('../../api/axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
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

describe('PropertiesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders properties page with title', () => {
    renderWithProviders(<PropertiesPage />);
    expect(screen.getByText('Properties')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    renderWithProviders(<PropertiesPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('displays empty state when no properties are found', async () => {
    renderWithProviders(<PropertiesPage />);
    await waitFor(() => {
      expect(screen.getByText(/No properties found/i)).toBeInTheDocument();
    });
  });

  test('displays "Add Property" button', () => {
    renderWithProviders(<PropertiesPage />);
    expect(screen.getByText('Add Property')).toBeInTheDocument();
  });

  test('search input works correctly', async () => {
    renderWithProviders(<PropertiesPage />);
    const searchInput = screen.getByPlaceholderText('Search properties by name or location...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput.value).toBe('test search');
  });
});
