import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Booking } from '../../types/booking';
import BookingTable from '../Bookings/BookingTable';

interface BookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  bookings: Booking[];
  propertyName?: string;
  roomTypeName?: string;
}

const BookingsModal: React.FC<BookingsModalProps> = ({
  isOpen,
  onClose,
  title,
  bookings,
  propertyName,
  roomTypeName
}) => {
  // Add dummy handlers to satisfy BookingTable props requirements
  const handleViewDetails = (booking: Booking) => {
    console.log('View details for booking:', booking.id);
    // In a real implementation, this would navigate to booking details
  };

  const handleEdit = (booking: Booking) => {
    console.log('Edit booking:', booking.id);
    // In a real implementation, this would open edit form
  };

  const handleDelete = (booking: Booking) => {
    console.log('Delete booking:', booking.id);
    // In a real implementation, this would show delete confirmation
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-background shadow-xl rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title
                  as="h3"
                  className="text-h3 font-semibold text-text"
                >
                  {title}
                </Dialog.Title>
                <button
                  type="button"
                  className="text-text-secondary hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {propertyName && (
                <div className="mb-4">
                  <span className="text-text-secondary">Property: </span>
                  <span className="font-medium text-text">{propertyName}</span>
                </div>
              )}
              
              {roomTypeName && (
                <div className="mb-4">
                  <span className="text-text-secondary">Room Type: </span>
                  <span className="font-medium text-text">{roomTypeName}</span>
                </div>
              )}
              
              <div className="mt-4">
                {bookings.length > 0 ? (
                  <BookingTable 
                    bookings={bookings} 
                    showPropertyColumn={!!propertyName}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    No bookings found.
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-text-secondary bg-background-subtle hover:bg-background-muted focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BookingsModal;
