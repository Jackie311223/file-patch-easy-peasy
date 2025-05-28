import React, { useState, useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useFilter } from '../../contexts/FilterContext';
import BookingsModal from '../common/BookingsModal';
import { Booking } from '../../types/booking';

interface RoomTypeBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  roomTypeId: string;
  roomTypeName: string;
  propertyName: string;
}

const RoomTypeBookingsModal: React.FC<RoomTypeBookingsModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  roomTypeId,
  roomTypeName,
  propertyName
}) => {
  const { getBookings } = useBookings();
  const { setFilters } = useFilter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isOpen || !roomTypeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Set filters for this room type - use direct object instead of updater function
        setFilters({
          propertyId: propertyId,
          roomTypeId: roomTypeId
        });
        
        // Fetch bookings with the updated filters
        const fetchedBookings = await getBookings();
        
        setBookings(fetchedBookings);
      } catch (err: any) {
        console.error('Error fetching bookings for room type:', err);
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isOpen, propertyId, roomTypeId, getBookings, setFilters]);

  return (
    <BookingsModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bookings for ${roomTypeName}`}
      bookings={bookings}
      propertyName={propertyName}
      roomTypeName={roomTypeName}
    />
  );
};

export default RoomTypeBookingsModal;
