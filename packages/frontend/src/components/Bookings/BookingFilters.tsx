import React from 'react';
import { useFilter } from '../../contexts/FilterContext';
import { BookingStatus, Channel, PaymentStatus } from '../../types/booking';
import { format } from 'date-fns';

// Update interface to include propertyId in roomTypes
interface BookingFiltersProps {
  properties: { id: string; name: string }[];
  roomTypes: { id: string; name: string; propertyId: string }[];
  className?: string;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({ 
  properties, 
  roomTypes,
  className = '' 
}) => {
  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilter();
  
  // Get today's date in YYYY-MM-DD format for date inputs
  const today = format(new Date(), 'yyyy-MM-dd');
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Property Filter */}
        <div>
          <label htmlFor="propertyFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Property
          </label>
          <select
            id="propertyFilter"
            value={filters.propertyId || ''}
            onChange={(e) => setFilter('propertyId', e.target.value || undefined)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
          >
            <option value="">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Room Type Filter - Only show if property is selected */}
        <div>
          <label htmlFor="roomTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Room Type
          </label>
          <select
            id="roomTypeFilter"
            value={filters.roomTypeId || ''}
            onChange={(e) => setFilter('roomTypeId', e.target.value || undefined)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            disabled={!filters.propertyId}
          >
            <option value="">All Room Types</option>
            {roomTypes
              .filter(rt => !filters.propertyId || rt.propertyId === filters.propertyId)
              .map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
          </select>
        </div>
        
        {/* Booking Status Filter */}
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Booking Status
          </label>
          <select
            id="statusFilter"
            value={filters.bookingStatus || ''}
            onChange={(e) => setFilter('bookingStatus', e.target.value as BookingStatus || undefined)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
          >
            <option value="">All Statuses</option>
            {Object.values(BookingStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        
        {/* Channel Filter */}
        <div>
          <label htmlFor="channelFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Channel
          </label>
          <select
            id="channelFilter"
            value={filters.channel || ''}
            onChange={(e) => setFilter('channel', e.target.value as Channel || undefined)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
          >
            <option value="">All Channels</option>
            {Object.values(Channel).map((channel) => (
              <option key={channel} value={channel}>
                {channel.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        
        {/* Payment Status Filter */}
        <div>
          <label htmlFor="paymentStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            id="paymentStatusFilter"
            value={filters.paymentStatus || ''}
            onChange={(e) => setFilter('paymentStatus', e.target.value as PaymentStatus || undefined)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
          >
            <option value="">All Payment Statuses</option>
            {Object.values(PaymentStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date Range Filters */}
        <div>
          <label htmlFor="startDateFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Check-in From
          </label>
          <input
            type="date"
            id="startDateFilter"
            value={filters.startDate || ''}
            onChange={(e) => setFilter('startDate', e.target.value || undefined)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="endDateFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Check-in To
          </label>
          <input
            type="date"
            id="endDateFilter"
            value={filters.endDate || ''}
            min={filters.startDate || ''}
            onChange={(e) => setFilter('endDate', e.target.value || undefined)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
          />
        </div>
        
        {/* Search Term */}
        <div>
          <label htmlFor="searchTermFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="searchTermFilter"
            placeholder="Guest name, phone, email..."
            value={filters.searchTerm || ''}
            onChange={(e) => setFilter('searchTerm', e.target.value || undefined)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
          />
        </div>
      </div>
      
      {/* Clear Filters Button - Only show if filters are active */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingFilters;
