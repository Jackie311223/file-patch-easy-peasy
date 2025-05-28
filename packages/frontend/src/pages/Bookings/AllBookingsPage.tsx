import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../../types/booking';
import BookingTable from '../../components/Bookings/BookingTable';
import BookingFilters from '../../components/Bookings/BookingFilters';
import BookingDetailModal from '@/components/common/BookingDetailModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import FormModal from '@/components/common/FormModal';
import BookingForm from '../../components/Bookings/BookingForm';
import { FormSchemaType } from '../../components/Bookings/BookingForm';
import { useBookings } from '../../hooks/useBookings';
import { useFilter } from '../../contexts/FilterContext';
import Button from '@/components/common/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

const AllBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters } = useFilter();
  const { bookings, loading, error, createBooking, updateBooking, deleteBooking } = useBookings();
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(undefined); // Changed from null to undefined
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock data for filters
  // In a real app, these would come from API calls or context
  const properties = bookings
    .map(booking => booking.property)
    .filter((property, index, self) => 
      property && self.findIndex(p => p?.id === property?.id) === index
    ) as { id: string; name: string }[];
  
  // Ensure all roomTypes have a propertyId by using booking.propertyId when available
  const roomTypes = bookings
    .map(booking => {
      if (booking.roomType) {
        return {
          id: booking.roomType.id,
          name: booking.roomType.name,
          propertyId: booking.propertyId // Always use the booking's propertyId
        };
      }
      return null;
    })
    .filter((roomType): roomType is { id: string; name: string; propertyId: string } => 
      roomType !== null && 
      roomTypes.findIndex(rt => rt && rt.id === roomType.id) === -1
    );
  
  // Handle view booking details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };
  
  // Handle edit booking
  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsFormModalOpen(true);
  };
  
  // Handle delete booking
  const handleDelete = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteModalOpen(true);
  };
  
  // Handle create new booking
  const handleCreate = () => {
    setSelectedBooking(undefined); // Changed from null to undefined
    setIsFormModalOpen(true);
  };
  
  // Handle form submission (create/update)
  const handleFormSubmit = async (data: FormSchemaType, id?: string) => {
    setIsSubmitting(true);
    try {
      if (id) {
        // Update existing booking
        await updateBooking(id, data);
      } else {
        // Create new booking
        await createBooking(data);
      }
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('Error saving booking:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedBooking) return;
    
    setIsSubmitting(true);
    try {
      await deleteBooking(selectedBooking.id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If there's an error loading bookings
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading bookings: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">All Bookings</h1>
        <Button 
          onClick={handleCreate}
          variant="primary"
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          New Booking
        </Button>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <BookingFilters 
          properties={properties} 
          roomTypes={roomTypes} 
        />
      </div>
      
      {/* Bookings Table */}
      <BookingTable 
        bookings={bookings}
        isLoading={loading}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* Booking Detail Modal */}
      <BookingDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        booking={selectedBooking}
      />
      
      {/* Booking Form Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedBooking ? 'Edit Booking' : 'Create New Booking'}
        hideFooter={true} // Form has its own buttons
        size="lg"
      >
        <BookingForm 
          initialData={selectedBooking}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          isLoading={isSubmitting}
        />
      </FormModal>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Booking"
        message={`Are you sure you want to delete the booking for ${selectedBooking?.guestName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
};

export default AllBookingsPage;
