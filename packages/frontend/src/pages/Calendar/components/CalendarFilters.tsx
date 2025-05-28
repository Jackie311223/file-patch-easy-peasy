import React from 'react';

interface CalendarFiltersProps {
  properties: Array<{ id: string; name: string }>;
  selectedProperty: string;
  selectedStatus: string[];
  selectedRoomType: string;
  onFilterChange: (filters: { propertyId?: string; bookingStatus?: string[]; roomTypeId?: string }) => void;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  properties,
  selectedProperty,
  selectedStatus,
  selectedRoomType,
  onFilterChange,
}) => {
  // Booking status options
  const statusOptions = [
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
    { value: 'PENDING', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'CHECKED_IN', label: 'Checked In', color: 'bg-blue-100 text-blue-800' },
    { value: 'CHECKED_OUT', label: 'Checked Out', color: 'bg-purple-100 text-purple-800' },
    { value: 'NO_SHOW', label: 'No Show', color: 'bg-gray-100 text-gray-800' },
  ];

  // Room type options (would typically come from API)
  const roomTypeOptions = [
    { id: '', name: 'All Room Types' },
    { id: 'room-type-1', name: 'Standard' },
    { id: 'room-type-2', name: 'Deluxe' },
    { id: 'room-type-3', name: 'Suite' },
  ];

  // Handle property change
  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ propertyId: e.target.value });
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    
    onFilterChange({ bookingStatus: newStatus });
  };

  // Handle room type change
  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ roomTypeId: e.target.value });
  };

  return (
    <div className="calendar-filters bg-white p-4 border-b border-gray-200 flex flex-wrap items-center gap-4">
      {/* Property Filter */}
      <div className="filter-group">
        <label htmlFor="property-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Property
        </label>
        <select
          id="property-filter"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          value={selectedProperty}
          onChange={handlePropertyChange}
        >
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="filter-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(status => (
            <button
              key={status.value}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                selectedStatus.includes(status.value)
                  ? status.color
                  : 'bg-gray-100 text-gray-800 opacity-60'
              }`}
              onClick={() => handleStatusChange(status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room Type Filter */}
      <div className="filter-group">
        <label htmlFor="room-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Room Type
        </label>
        <select
          id="room-type-filter"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          value={selectedRoomType}
          onChange={handleRoomTypeChange}
        >
          {roomTypeOptions.map(roomType => (
            <option key={roomType.id} value={roomType.id}>
              {roomType.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CalendarFilters;
