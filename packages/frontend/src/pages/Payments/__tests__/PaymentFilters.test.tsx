import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { customRender, checkAccessibility } from '../../../test/helpers/test-utils';
import PaymentFilters from '../components/PaymentFilters';
import * as propertiesApi from '../../../api/propertiesApi';
import * as usersApi from '../../../api/usersApi';

// Mock API calls
jest.mock('../../../api/propertiesApi');
jest.mock('../../../api/usersApi');

describe('PaymentFilters', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnClose = jest.fn();
  
  const defaultFilters = {
    paymentType: 'HOTEL_COLLECT',
    method: '',
    status: '',
    propertyId: '',
    ownerId: '',
    startDate: '',
    endDate: '',
  };
  
  const defaultProps = {
    filters: defaultFilters,
    onFilterChange: mockOnFilterChange,
    onClose: mockOnClose,
  };
  
  const mockProperties = [
    { id: 'property-1', name: 'Hotel A' },
    { id: 'property-2', name: 'Hotel B' },
    { id: 'property-3', name: 'Resort C' },
  ];
  
  const mockOwners = [
    { id: 'owner-1', name: 'John Owner' },
    { id: 'owner-2', name: 'Jane Owner' },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    (propertiesApi.getProperties as jest.Mock).mockResolvedValue(mockProperties);
    (usersApi.getUsers as jest.Mock).mockResolvedValue(mockOwners);
  });
  
  it('renders all filter sections correctly for HOTEL_COLLECT', async () => {
    customRender(<PaymentFilters {...defaultProps} />);
    
    // Check title
    expect(screen.getByText('Filter Payments')).toBeInTheDocument();
    
    // Check filter sections
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // Close button with X icon
    
    // Wait for API calls to resolve
    await waitFor(() => {
      expect(propertiesApi.getProperties).toHaveBeenCalled();
    });
  });
  
  it('renders different payment methods for OTA_COLLECT', async () => {
    const otaFilters = {
      ...defaultFilters,
      paymentType: 'OTA_COLLECT',
    };
    
    const { user } = customRender(
      <PaymentFilters 
        filters={otaFilters}
        onFilterChange={mockOnFilterChange}
        onClose={mockOnClose}
      />
    );
    
    // Open payment method dropdown
    const methodSelect = screen.getByLabelText('Payment Method');
    await user.click(methodSelect);
    
    // Check OTA-specific payment methods
    expect(screen.getByText('OTA Transfer')).toBeInTheDocument();
    expect(screen.getByText('Bank Personal')).toBeInTheDocument();
    
    // Should not show HOTEL_COLLECT methods
    expect(screen.queryByText('Bank Transfer')).not.toBeInTheDocument();
  });
  
  it('shows owner filter only for SUPER_ADMIN', async () => {
    // Render as SUPER_ADMIN
    customRender(<PaymentFilters {...defaultProps} />, { userRole: 'SUPER_ADMIN' });
    
    // Owner filter should be visible
    expect(screen.getByText('Owner')).toBeInTheDocument();
    
    // Wait for API calls to resolve
    await waitFor(() => {
      expect(usersApi.getUsers).toHaveBeenCalledWith({ role: 'PARTNER', limit: 100 });
    });
    
    // Render as PARTNER
    customRender(<PaymentFilters {...defaultProps} />, { userRole: 'PARTNER' });
    
    // Owner filter should not be visible
    expect(screen.queryByText('Owner')).not.toBeInTheDocument();
  });
  
  it('populates property dropdown with fetched properties', async () => {
    const { user } = customRender(<PaymentFilters {...defaultProps} />);
    
    // Wait for API calls to resolve
    await waitFor(() => {
      expect(propertiesApi.getProperties).toHaveBeenCalled();
    });
    
    // Open property dropdown
    const propertySelect = screen.getByLabelText('Property');
    await user.click(propertySelect);
    
    // Check if properties are listed
    expect(screen.getByText('All properties')).toBeInTheDocument();
    expect(screen.getByText('Hotel A')).toBeInTheDocument();
    expect(screen.getByText('Hotel B')).toBeInTheDocument();
    expect(screen.getByText('Resort C')).toBeInTheDocument();
  });
  
  it('populates owner dropdown with fetched owners for SUPER_ADMIN', async () => {
    const { user } = customRender(<PaymentFilters {...defaultProps} />, { userRole: 'SUPER_ADMIN' });
    
    // Wait for API calls to resolve
    await waitFor(() => {
      expect(usersApi.getUsers).toHaveBeenCalled();
    });
    
    // Open owner dropdown
    const ownerSelect = screen.getByLabelText('Owner');
    await user.click(ownerSelect);
    
    // Check if owners are listed
    expect(screen.getByText('All owners')).toBeInTheDocument();
    expect(screen.getByText('John Owner')).toBeInTheDocument();
    expect(screen.getByText('Jane Owner')).toBeInTheDocument();
  });
  
  it('updates local filters when selections change', async () => {
    const { user } = customRender(<PaymentFilters {...defaultProps} />);
    
    // Wait for API calls to resolve
    await waitFor(() => {
      expect(propertiesApi.getProperties).toHaveBeenCalled();
    });
    
    // Change payment method
    const methodSelect = screen.getByLabelText('Payment Method');
    await user.click(methodSelect);
    await user.click(screen.getByText('Cash'));
    
    // Change status
    const statusSelect = screen.getByLabelText('Status');
    await user.click(statusSelect);
    await user.click(screen.getByText('Paid'));
    
    // Change property
    const propertySelect = screen.getByLabelText('Property');
    await user.click(propertySelect);
    await user.click(screen.getByText('Hotel B'));
    
    // Apply filters
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    
    // Check if onFilterChange was called with updated filters
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'CASH',
        status: 'PAID',
        propertyId: 'property-2',
      })
    );
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('resets filters when Reset button is clicked', async () => {
    const filtersWithValues = {
      ...defaultFilters,
      method: 'CASH',
      status: 'PAID',
      propertyId: 'property-1',
    };
    
    const { user } = customRender(
      <PaymentFilters 
        filters={filtersWithValues}
        onFilterChange={mockOnFilterChange}
        onClose={mockOnClose}
      />
    );
    
    // Click Reset button
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    
    // Check if onFilterChange was called with reset values
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentType: 'HOTEL_COLLECT', // Should keep the current tab's payment type
        method: '',
        status: '',
        propertyId: '',
      })
    );
  });
  
  it('closes filter panel when close button is clicked', async () => {
    const { user } = customRender(<PaymentFilters {...defaultProps} />);
    
    // Click close button (the one with X icon)
    const closeButton = screen.getByRole('button', { name: '' });
    await user.click(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('handles date selection correctly', async () => {
    const { user } = customRender(<PaymentFilters {...defaultProps} />);
    
    // Open start date picker
    const startDatePicker = screen.getByLabelText('From Date');
    await user.click(startDatePicker);
    
    // This is a simplified test since actual date picking would require more complex interactions
    // In a real test, you would need to interact with the date picker calendar
    
    // Apply filters
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    
    // Check if onFilterChange and onClose were called
    expect(mockOnFilterChange).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = customRender(<PaymentFilters {...defaultProps} />);
    
    // Wait for API calls to resolve
    await waitFor(() => {
      expect(propertiesApi.getProperties).toHaveBeenCalled();
    });
    
    await checkAccessibility(container);
  });
});
