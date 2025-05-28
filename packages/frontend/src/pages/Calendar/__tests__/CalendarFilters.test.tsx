import React from 'react';
import { screen } from '@testing-library/react';
import { customRender, checkAccessibility } from '../../../test/helpers/test-utils';
import CalendarFilters from '../components/CalendarFilters';

describe('CalendarFilters', () => {
  const mockOnFilterChange = jest.fn();
  
  const defaultProps = {
    properties: [
      { id: 'property-1', name: 'Hotel A' },
      { id: 'property-2', name: 'Hotel B' },
      { id: 'property-3', name: 'Resort C' },
    ],
    selectedProperty: 'property-1',
    selectedStatus: ['CONFIRMED', 'PENDING'],
    selectedRoomType: '',
    onFilterChange: mockOnFilterChange,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders all filter sections correctly', () => {
    customRender(<CalendarFilters {...defaultProps} />);
    
    // Check property filter
    expect(screen.getByLabelText('Property')).toBeInTheDocument();
    expect(screen.getByText('Hotel A')).toBeInTheDocument();
    expect(screen.getByText('Hotel B')).toBeInTheDocument();
    expect(screen.getByText('Resort C')).toBeInTheDocument();
    
    // Check status filter
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Checked In')).toBeInTheDocument();
    expect(screen.getByText('Checked Out')).toBeInTheDocument();
    expect(screen.getByText('No Show')).toBeInTheDocument();
    
    // Check room type filter
    expect(screen.getByLabelText('Room Type')).toBeInTheDocument();
    expect(screen.getByText('All Room Types')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Deluxe')).toBeInTheDocument();
    expect(screen.getByText('Suite')).toBeInTheDocument();
  });
  
  it('selects the correct property option', () => {
    customRender(<CalendarFilters {...defaultProps} />);
    
    const propertySelect = screen.getByLabelText('Property') as HTMLSelectElement;
    expect(propertySelect.value).toBe('property-1');
  });
  
  it('highlights selected status buttons', () => {
    customRender(<CalendarFilters {...defaultProps} />);
    
    // Selected status buttons should have full opacity
    const confirmedButton = screen.getByText('Confirmed');
    const pendingButton = screen.getByText('Pending');
    const cancelledButton = screen.getByText('Cancelled');
    
    expect(confirmedButton).not.toHaveClass('opacity-60');
    expect(pendingButton).not.toHaveClass('opacity-60');
    expect(cancelledButton).toHaveClass('opacity-60');
  });
  
  it('selects the correct room type option', () => {
    customRender(<CalendarFilters {...defaultProps} />);
    
    const roomTypeSelect = screen.getByLabelText('Room Type') as HTMLSelectElement;
    expect(roomTypeSelect.value).toBe('');
    
    // Test with a specific room type selected
    customRender(<CalendarFilters {...defaultProps} selectedRoomType="room-type-2" />);
    
    const updatedRoomTypeSelect = screen.getByLabelText('Room Type') as HTMLSelectElement;
    expect(updatedRoomTypeSelect.value).toBe('room-type-2');
  });
  
  it('calls onFilterChange when property is changed', async () => {
    const { user } = customRender(<CalendarFilters {...defaultProps} />);
    
    const propertySelect = screen.getByLabelText('Property');
    await user.selectOptions(propertySelect, 'property-2');
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({ propertyId: 'property-2' });
  });
  
  it('calls onFilterChange when status is toggled', async () => {
    const { user } = customRender(<CalendarFilters {...defaultProps} />);
    
    // Toggle an already selected status (CONFIRMED)
    const confirmedButton = screen.getByText('Confirmed');
    await user.click(confirmedButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({ 
      bookingStatus: ['PENDING'] 
    });
    
    // Toggle an unselected status (CANCELLED)
    mockOnFilterChange.mockClear();
    const cancelledButton = screen.getByText('Cancelled');
    await user.click(cancelledButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({ 
      bookingStatus: ['CONFIRMED', 'PENDING', 'CANCELLED'] 
    });
  });
  
  it('calls onFilterChange when room type is changed', async () => {
    const { user } = customRender(<CalendarFilters {...defaultProps} />);
    
    const roomTypeSelect = screen.getByLabelText('Room Type');
    await user.selectOptions(roomTypeSelect, 'room-type-3');
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({ roomTypeId: 'room-type-3' });
  });
  
  it('applies correct color classes to status buttons', () => {
    customRender(<CalendarFilters {...defaultProps} />);
    
    const confirmedButton = screen.getByText('Confirmed');
    const pendingButton = screen.getByText('Pending');
    const cancelledButton = screen.getByText('Cancelled');
    const checkedInButton = screen.getByText('Checked In');
    const checkedOutButton = screen.getByText('Checked Out');
    const noShowButton = screen.getByText('No Show');
    
    expect(confirmedButton).toHaveClass('bg-green-100', 'text-green-800');
    expect(pendingButton).toHaveClass('bg-amber-100', 'text-amber-800');
    expect(cancelledButton).toHaveClass('bg-gray-100', 'text-gray-800', 'opacity-60');
    expect(checkedInButton).toHaveClass('bg-gray-100', 'text-gray-800', 'opacity-60');
    expect(checkedOutButton).toHaveClass('bg-gray-100', 'text-gray-800', 'opacity-60');
    expect(noShowButton).toHaveClass('bg-gray-100', 'text-gray-800', 'opacity-60');
  });
  
  it('has no accessibility violations', async () => {
    const { container } = customRender(<CalendarFilters {...defaultProps} />);
    await checkAccessibility(container);
  });
});
