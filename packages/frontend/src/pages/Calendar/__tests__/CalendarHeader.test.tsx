import React from 'react';
import { screen } from '@testing-library/react';
import { customRender, checkAccessibility } from '../../../test/helpers/test-utils';
import CalendarHeader from '../components/CalendarHeader';
import { format, addDays } from 'date-fns';

describe('CalendarHeader', () => {
  const mockOnViewModeChange = jest.fn();
  const mockOnDateChange = jest.fn();
  
  const defaultProps = {
    viewMode: 'week' as const,
    onViewModeChange: mockOnViewModeChange,
    dateRange: {
      start: new Date('2025-06-01'),
      end: new Date('2025-06-08'),
    },
    onDateChange: mockOnDateChange,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly with week view mode', () => {
    customRender(<CalendarHeader {...defaultProps} />);
    
    // Check title
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    
    // Check date range
    expect(screen.getByText('Jun 1 - 8, 2025')).toBeInTheDocument();
    
    // Check view mode buttons
    const weekButton = screen.getByText('Week');
    const monthButton = screen.getByText('Month');
    
    expect(weekButton).toBeInTheDocument();
    expect(monthButton).toBeInTheDocument();
    
    // Week button should be active
    expect(weekButton.closest('button')).toHaveClass('bg-white');
    expect(monthButton.closest('button')).not.toHaveClass('bg-white');
    
    // Check navigation buttons
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });
  
  it('renders correctly with month view mode', () => {
    customRender(<CalendarHeader {...defaultProps} viewMode="month" />);
    
    const weekButton = screen.getByText('Week');
    const monthButton = screen.getByText('Month');
    
    // Month button should be active
    expect(weekButton.closest('button')).not.toHaveClass('bg-white');
    expect(monthButton.closest('button')).toHaveClass('bg-white');
  });
  
  it('calls onViewModeChange when view mode buttons are clicked', async () => {
    const { user } = customRender(<CalendarHeader {...defaultProps} />);
    
    // Click Month button
    await user.click(screen.getByText('Month'));
    expect(mockOnViewModeChange).toHaveBeenCalledWith('month');
    
    // Click Week button
    await user.click(screen.getByText('Week'));
    expect(mockOnViewModeChange).toHaveBeenCalledWith('week');
  });
  
  it('calls onDateChange when navigation buttons are clicked', async () => {
    const { user } = customRender(<CalendarHeader {...defaultProps} />);
    
    // Click Previous button
    await user.click(screen.getByLabelText('Previous'));
    expect(mockOnDateChange).toHaveBeenCalledWith('prev');
    
    // Click Today button
    await user.click(screen.getByText('Today'));
    expect(mockOnDateChange).toHaveBeenCalledWith('today');
    
    // Click Next button
    await user.click(screen.getByLabelText('Next'));
    expect(mockOnDateChange).toHaveBeenCalledWith('next');
  });
  
  it('formats date range correctly when in same month', () => {
    customRender(<CalendarHeader {...defaultProps} />);
    expect(screen.getByText('Jun 1 - 8, 2025')).toBeInTheDocument();
  });
  
  it('formats date range correctly when spanning different months', () => {
    const dateRange = {
      start: new Date('2025-06-28'),
      end: new Date('2025-07-05'),
    };
    
    customRender(<CalendarHeader {...defaultProps} dateRange={dateRange} />);
    expect(screen.getByText('Jun 28 - Jul 5, 2025')).toBeInTheDocument();
  });
  
  it('formats date range correctly when spanning different years', () => {
    const dateRange = {
      start: new Date('2025-12-28'),
      end: new Date('2026-01-04'),
    };
    
    customRender(<CalendarHeader {...defaultProps} dateRange={dateRange} />);
    expect(screen.getByText('Dec 28, 2025 - Jan 4, 2026')).toBeInTheDocument();
  });
  
  it('disables Today button when current date is displayed', () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    customRender(
      <CalendarHeader 
        {...defaultProps} 
        dateRange={{
          start: today,
          end: nextWeek,
        }}
      />
    );
    
    const todayButton = screen.getByText('Today');
    expect(todayButton).toBeDisabled();
  });
  
  it('enables Today button when current date is not displayed', () => {
    // Use a fixed date in the future
    const futureDate = new Date('2025-06-01');
    const nextWeek = addDays(futureDate, 7);
    
    customRender(
      <CalendarHeader 
        {...defaultProps} 
        dateRange={{
          start: futureDate,
          end: nextWeek,
        }}
      />
    );
    
    const todayButton = screen.getByText('Today');
    expect(todayButton).not.toBeDisabled();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = customRender(<CalendarHeader {...defaultProps} />);
    await checkAccessibility(container);
  });
});
