import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { useBookings } from '../../hooks/useBookings';
import RoomTypeBookingsModal from './RoomTypeBookingsModal';

interface RoomTypeBookingsLinkProps {
  propertyId: string;
  roomTypeId: string;
  roomTypeName: string;
  propertyName: string;
  className?: string;
}

const RoomTypeBookingsLink: React.FC<RoomTypeBookingsLinkProps> = ({ 
  propertyId, 
  roomTypeId,
  roomTypeName,
  propertyName,
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };
  
  return (
    <>
      <Button
        variant="text"
        size="small"
        onClick={handleClick}
        title="View Bookings for this Room Type"
        className={`text-secondary hover:bg-secondary/10 focus:ring-secondary/50 ${className}`}
      >
        <CalendarIcon className="h-5 w-5" />
        <span className="ml-sm">Bookings</span>
      </Button>
      
      <RoomTypeBookingsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        propertyId={propertyId}
        roomTypeId={roomTypeId}
        roomTypeName={roomTypeName}
        propertyName={propertyName}
      />
    </>
  );
};

export default RoomTypeBookingsLink;
