import React from 'react';
import { format, isToday } from 'date-fns';

interface CalendarHeaderProps {
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
  dateRange: {
    start: Date;
    end: Date;
  };
  onDateChange: (direction: 'prev' | 'next' | 'today') => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  dateRange,
  onDateChange,
}) => {
  const formatDateRange = () => {
    const { start, end } = dateRange;
    const startMonth = format(start, 'MMM');
    const endMonth = format(end, 'MMM');
    const startYear = format(start, 'yyyy');
    const endYear = format(end, 'yyyy');

    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${format(start, 'd')} - ${format(end, 'd')}, ${startYear}`;
    } else if (startYear === endYear) {
      return `${startMonth} ${format(start, 'd')} - ${endMonth} ${format(end, 'd')}, ${startYear}`;
    } else {
      return `${startMonth} ${format(start, 'd')}, ${startYear} - ${endMonth} ${format(end, 'd')}, ${endYear}`;
    }
  };

  return (
    <div className="calendar-header bg-white p-4 border-b border-gray-200 flex flex-wrap items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
        <div className="text-lg font-medium text-gray-600">{formatDateRange()}</div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-gray-100 rounded-md p-1">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              viewMode === 'week' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => onViewModeChange('week')}
          >
            Week
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              viewMode === 'month' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => onViewModeChange('month')}
          >
            Month
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => onDateChange('prev')}
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
            onClick={() => onDateChange('today')}
            disabled={isToday(dateRange.start)}
          >
            Today
          </button>
          <button
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => onDateChange('next')}
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
