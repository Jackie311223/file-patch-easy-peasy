import React from 'react';
import { useDrag } from 'react-dnd';
import { format } from 'date-fns';
import Popover from '@/ui/Popover';
import BookingPopover from './BookingPopover';

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
}

interface BookingBlockProps {
  booking: Booking;
  onClick: () => void;
  onDrag: (bookingId: string, newDates: { start: Date; end: Date }) => void;
  onRoomChange: (bookingId: string, roomId: string) => void;
}

const BookingBlock: React.FC<BookingBlockProps> = ({ booking, onClick, onDrag, onRoomChange }) => {
  // Set booking block color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'PENDING':
        return 'bg-amber-100 border-amber-500 text-amber-800';
      case 'CANCELLED':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'CHECKED_IN':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'CHECKED_OUT':
        return 'bg-purple-100 border-purple-500 text-purple-800';
      case 'NO_SHOW':
        return 'bg-gray-100 border-gray-500 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  // Setup drag and drop
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'booking',
    item: { id: booking.id, roomId: booking.roomId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        // Handle drop result if needed
      }
    },
  });

  // Format dates for display
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  
  return (
    <Popover
      trigger={
        <div
          ref={drag as unknown as React.RefObject<HTMLDivElement>}
          className={`booking-block p-2 rounded-md border-l-4 cursor-pointer transition-opacity ${
            getStatusColor(booking.status)
          } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
          onClick={onClick} // Keep onClick for direct interaction if needed, or remove if Popover handles it
          style={{ opacity: isDragging ? 0.5 : 1 }}
        >
          <div className="flex justify-between items-start">
            <div className="font-medium truncate">{booking.guestName}</div>
            {booking.isVIP && (
              <span className="ml-1 text-yellow-500" title="VIP Guest">
                ⭐
              </span>
            )}
          </div>
          
          <div className="text-xs mt-1 flex justify-between">
            <div>
              {format(checkInDate, 'MMM d')} - {format(checkOutDate, 'MMM d')}
            </div>
            <div className="font-medium">{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</div>
          </div>
          
          <div className="text-xs mt-1 flex justify-between">
            <div className="truncate">{booking.roomName}</div>
            <div className="truncate text-gray-600">{booking.source}</div>
          </div>
          
          {booking.notes && (
            <div className="mt-1 text-xs text-gray-600 truncate" title={booking.notes}>
              📝 {booking.notes}
            </div>
          )}
        </div>
      }
      content={<BookingPopover booking={booking} />}
    />
  );
};

export default BookingBlock;
