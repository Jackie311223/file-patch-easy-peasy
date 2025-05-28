import React from 'react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  guestName: string;
  checkIn: string | Date;
  checkOut: string | Date;
  nights: number;
  status: string;
  roomId: string;
  roomName: string;
  roomTypeId: string;
  roomTypeName: string;
  source: string;
  notes?: string;
  isVIP?: boolean;
  totalAmount: number;
  adults?: number;
  children?: number;
}

interface BookingPopoverProps {
  booking: Booking;
}

const BookingPopover: React.FC<BookingPopoverProps> = ({ booking }) => {
  // Format dates for display
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800';
      case 'CHECKED_OUT':
        return 'bg-purple-100 text-purple-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="booking-popover p-3 w-64 max-w-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-bold">
          {booking.guestName}
          {booking.isVIP && <span className="ml-1 text-yellow-500">⭐</span>}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(booking.status)}`}>
          {booking.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="col-span-2 border-b border-gray-200 pb-2 mb-2">
          <div className="flex justify-between">
            <div className="text-gray-600">Check-in:</div>
            <div className="font-medium">{format(checkInDate, 'EEE, MMM d, yyyy')}</div>
          </div>
          <div className="flex justify-between mt-1">
            <div className="text-gray-600">Check-out:</div>
            <div className="font-medium">{format(checkOutDate, 'EEE, MMM d, yyyy')}</div>
          </div>
          <div className="flex justify-between mt-1">
            <div className="text-gray-600">Nights:</div>
            <div className="font-medium">{booking.nights}</div>
          </div>
        </div>
        
        <div className="text-gray-600">Room:</div>
        <div className="font-medium">{booking.roomName}</div>
        
        <div className="text-gray-600">Room Type:</div>
        <div className="font-medium">{booking.roomTypeName}</div>
        
        {(booking.adults !== undefined || booking.children !== undefined) && (
          <>
            <div className="text-gray-600">Guests:</div>
            <div className="font-medium">
              {booking.adults || 0} Adult{booking.adults !== 1 ? 's' : ''}, 
              {booking.children || 0} Child{booking.children !== 1 ? 'ren' : ''}
            </div>
          </>
        )}
        
        <div className="text-gray-600">Source:</div>
        <div className="font-medium">{booking.source}</div>
        
        <div className="text-gray-600">Total:</div>
        <div className="font-medium">{formatCurrency(booking.totalAmount)}</div>
      </div>
      
      {booking.notes && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-gray-600 text-sm">Notes:</div>
          <div className="text-sm mt-1">{booking.notes}</div>
        </div>
      )}
      
      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        Click to edit booking details
      </div>
    </div>
  );
};

export default BookingPopover;
