import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookingForm from '../../components/Bookings/BookingForm';
import { useBookings } from '../../hooks/useBookings';
import { Booking } from '../../types/booking'; // Keep Booking type for initialData
// Import the type inferred from Zod schema, which BookingForm uses
import { FormSchemaType } from '../../components/Bookings/BookingForm'; 
import { toast } from 'react-toastify';

const EditBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, propertyId } = useParams<{ id: string; propertyId?: string }>(); // Get booking ID and optional propertyId
  const { getBooking, updateBooking, loading, error } = useBookings();
  const [initialData, setInitialData] = useState<Booking | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) {
        setFetchError('Booking ID is missing.');
        return;
      }
      try {
        const bookingData = await getBooking(id);
        setInitialData(bookingData);
      } catch (err: any) {
        console.error('Failed to fetch booking for editing:', err);
        setFetchError(err.message || 'Failed to load booking details.');
      }
    };
    fetchBooking();
  }, [id, getBooking]);

  // handleSubmit now receives FormSchemaType directly from BookingForm
  const handleSubmit = async (data: FormSchemaType, bookingId?: string) => { 
    if (!bookingId) {
        toast.error('Cannot update booking: Booking ID is missing.');
        return;
    }
    try {
      // Pass the data directly as it matches the expected structure (with numbers)
      await updateBooking(bookingId, data); 
      toast.success('Booking updated successfully!');
      // Navigate back to the booking detail page or the list page
      navigate(propertyId ? `/properties/${propertyId}/bookings/${bookingId}` : `/bookings/${bookingId}`);
    } catch (error: any) {
      console.error('Failed to update booking:', error);
      toast.error(error.message || 'Failed to update booking.');
    }
  };

  const handleCancel = () => {
    // Navigate back
    if (id) {
        navigate(propertyId ? `/properties/${propertyId}/bookings/${id}` : `/bookings/${id}`);
    } else {
        navigate(propertyId ? `/properties/${propertyId}/bookings` : '/bookings');
    }
  };

  if (loading && !initialData) return <div className="px-xl py-lg">Loading booking details...</div>; // Show loading state while fetching
  if (fetchError || error) return <div className="px-xl py-lg text-error">Error: {fetchError || error}</div>;
  if (!initialData) return <div className="px-xl py-lg">Booking not found.</div>; // Handle case where booking isn't found

  return (
    <div className="px-xl py-lg">
      <h1 className="text-h1 text-text mb-xl">Edit Booking</h1>
      <BookingForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        isLoading={loading} 
        initialData={initialData || undefined} // Pass the fetched Booking object or undefined
      />
    </div>
  );
};

export default EditBookingPage;
