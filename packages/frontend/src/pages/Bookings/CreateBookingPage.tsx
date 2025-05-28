import React from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import BookingForm from '../../components/Bookings/BookingForm';
import { useBookings } from '../../hooks/useBookings';
// Import the type inferred from Zod schema, which BookingForm uses
import { FormSchemaType } from '../../components/Bookings/BookingForm'; 
import { toast } from 'react-toastify';

const CreateBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { propertyId: propertyIdFromParams } = useParams<{ propertyId: string }>();
  const { createBooking, loading } = useBookings();

  // Determine propertyId from query param or route param
  const propertyId = searchParams.get('propertyId') || propertyIdFromParams;

  // handleSubmit now receives FormSchemaType directly from BookingForm
  const handleSubmit = async (data: FormSchemaType) => { 
    if (!data.propertyId) {
        toast.error('Cannot create booking: Property ID is missing.');
        return;
    }
    try {
      // Pass the data directly as it matches the expected structure (with numbers)
      await createBooking(data); 
      toast.success('Booking created successfully!');
      // Navigate back based on context
      navigate(propertyIdFromParams ? `/properties/${data.propertyId}/bookings` : '/bookings');
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      toast.error(error.message || 'Failed to create booking.');
    }
  };

  const handleCancel = () => {
    // Navigate back based on context
    navigate(propertyIdFromParams ? `/properties/${propertyIdFromParams}/bookings` : '/bookings');
  };

  return (
    <div className="px-xl py-lg">
      <h1 className="text-h1 text-text mb-xl">Create New Booking</h1>
      <BookingForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
        initialData={undefined} // Pass undefined for new booking
      />
    </div>
  );
};

export default CreateBookingPage;
