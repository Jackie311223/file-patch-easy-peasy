import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Booking, // Import Booking type
    Channel,
    PaymentMethod,
    PaymentStatus,
    BookingStatus,
    DepositMethod,
    DepositStatus
} from '../../types/booking';
import { Property } from '../../types/property';
import { RoomType } from '../../types/roomType';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { format } from 'date-fns';

// Base Zod schema using coerce for number inputs from strings
const baseBookingFormSchema = z.object({
  propertyId: z.string().min(1, { message: 'Property selection is required.' }),
  roomTypeId: z.string().optional().or(z.literal(undefined)),
  guestName: z.string().min(1, { message: 'Guest name is required.' }),
  contactEmail: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal(undefined)),
  contactPhone: z.string().min(1, { message: 'Contact phone is required.' }),
  channel: z.nativeEnum(Channel, { errorMap: () => ({ message: 'Channel is required.' }) }),
  reference: z.string().optional().or(z.literal(undefined)),
  checkIn: z.string().min(1, { message: 'Check-in date is required.' }),
  checkOut: z.string().min(1, { message: 'Check-out date is required.' }),
  adults: z.coerce.number().int().min(1, { message: 'At least one adult is required.' }), // Use coerce
  children: z.coerce.number().int().min(0).optional().or(z.literal(undefined)), // Use coerce
  totalAmount: z.coerce.number().min(0, { message: 'Total amount must be non-negative.' }), // Use coerce
  commission: z.coerce.number().min(0).optional().or(z.literal(undefined)), // Use coerce
  currency: z.string().optional().or(z.literal(undefined)),
  paymentMethod: z.nativeEnum(PaymentMethod, { errorMap: () => ({ message: 'Payment method is required.' }) }),
  paymentChannel: z.string().optional().or(z.literal(undefined)),
  paymentStatus: z.nativeEnum(PaymentStatus).optional().or(z.literal(undefined)),
  amountPaid: z.coerce.number().min(0).optional().or(z.literal(undefined)), // Use coerce
  refundedAmount: z.coerce.number().min(0).optional().or(z.literal(undefined)), // Use coerce
  invoiceUrl: z.string().url({ message: 'Invalid URL format.' }).optional().or(z.literal(undefined)),
  assignedStaff: z.string().optional().or(z.literal(undefined)),
  specialRequests: z.string().optional().or(z.literal(undefined)),
  internalNotes: z.string().optional().or(z.literal(undefined)),
  bookingStatus: z.nativeEnum(BookingStatus).optional().or(z.literal(undefined)),
  depositAmount: z.coerce.number().min(0).optional().or(z.literal(undefined)), // Use coerce
  depositDate: z.string().optional().or(z.literal(undefined)),
  depositMethod: z.nativeEnum(DepositMethod).optional().or(z.literal(undefined)),
  depositStatus: z.nativeEnum(DepositStatus).optional().or(z.literal(undefined)),
});

// Final schema with refine for cross-field validation
// Export the schema constant directly
export const bookingFormSchema = baseBookingFormSchema.refine(data => data.checkOut > data.checkIn, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"],
});

// Infer the type from the FINAL (refined) schema
export type FormSchemaType = z.infer<typeof bookingFormSchema>;

// Utility function to convert Booking (API response) to FormSchemaType (Form state)
// Ensure this conversion aligns with the FormSchemaType structure
const convertBookingToFormData = (booking: Booking): Partial<FormSchemaType> & { id: string } => {
  return {
    id: booking.id,
    propertyId: booking.propertyId,
    roomTypeId: booking.roomTypeId ?? undefined,
    guestName: booking.guestName,
    contactEmail: booking.contactEmail ?? undefined,
    contactPhone: booking.contactPhone,
    channel: booking.channel,
    reference: booking.reference ?? undefined,
    checkIn: format(new Date(booking.checkIn), 'yyyy-MM-dd'),
    checkOut: format(new Date(booking.checkOut), 'yyyy-MM-dd'),
    adults: booking.adults, // Already number
    children: booking.children ?? undefined, // Already number or undefined
    totalAmount: booking.totalAmount, // Already number
    commission: booking.commission ?? undefined, // Already number or undefined
    currency: booking.currency ?? undefined,
    paymentMethod: booking.paymentMethod,
    paymentChannel: booking.paymentChannel ?? undefined,
    paymentStatus: booking.paymentStatus ?? undefined,
    amountPaid: booking.amountPaid ?? undefined, // Already number or undefined
    refundedAmount: booking.refundedAmount ?? undefined, // Already number or undefined
    invoiceUrl: booking.invoiceUrl ?? undefined,
    assignedStaff: booking.assignedStaff ?? undefined,
    specialRequests: booking.specialRequests ?? undefined,
    internalNotes: booking.internalNotes ?? undefined,
    bookingStatus: booking.bookingStatus ?? undefined,
    depositAmount: booking.depositAmount ?? undefined, // Already number or undefined
    depositDate: booking.depositDate ? format(new Date(booking.depositDate), 'yyyy-MM-dd') : undefined,
    depositMethod: booking.depositMethod ?? undefined,
    depositStatus: booking.depositStatus ?? undefined,
  };
};

// Prepare initial data for the form, using defaults or converted Booking data
const prepareInitialData = (data?: Booking): Partial<FormSchemaType> => {
  if (!data) {
    // Default values for a new booking form, matching FormSchemaType
    return {
        propertyId: '',
        roomTypeId: undefined,
        guestName: '',
        contactEmail: undefined,
        contactPhone: '',
        channel: undefined,
        reference: undefined,
        checkIn: '',
        checkOut: '',
        adults: 1,
        children: undefined,
        totalAmount: 0, // Default to number
        commission: undefined,
        currency: 'VND',
        paymentMethod: undefined,
        paymentChannel: undefined,
        paymentStatus: PaymentStatus.UNPAID,
        amountPaid: 0, // Default to number
        refundedAmount: undefined,
        invoiceUrl: undefined,
        assignedStaff: undefined,
        specialRequests: undefined,
        internalNotes: undefined,
        bookingStatus: BookingStatus.PENDING,
        depositAmount: undefined,
        depositDate: undefined,
        depositMethod: undefined,
        depositStatus: DepositStatus.PENDING,
    };
  }
  // Convert existing Booking data to form data
  const { id, ...formData } = convertBookingToFormData(data);
  return formData;
};

interface BookingFormProps {
  initialData?: Booking;
  onSubmit: (data: FormSchemaType, id?: string) => void; // Use inferred type from refined schema
  onCancel: () => void;
  isLoading?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const { token } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  // Use the inferred type from the refined schema for useForm
  const { register, handleSubmit, control, formState: { errors }, watch, reset, setValue } = useForm<FormSchemaType>({
    resolver: zodResolver(bookingFormSchema), // Use the refined schema here
    // Initialize with default values, will be updated by useEffect
    defaultValues: prepareInitialData(undefined), 
  });

  const selectedPropertyId = watch("propertyId");

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    const preparedData = prepareInitialData(initialData);
    reset(preparedData); // Reset the form first
    // PropertyId and RoomTypeId will be set in subsequent effects after data loads
  }, [initialData, reset]);

  // Fetch properties
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchProperties = async () => {
      try {
        const response = await api.get<Property[]>('/properties', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setProperties(response.data);
          // Set default property if creating new and only one property exists
          if (!initialData?.id && response.data.length === 1) {
             setValue("propertyId", response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };
    if (token) {
      fetchProperties();
    }
    return () => { isMounted = false; }; // Cleanup
  }, [token, initialData?.id, setValue]); // Depend on initialData.id to refetch if mode changes

  // Effect to set propertyId *after* properties are loaded and initialData is processed
  useEffect(() => {
      if (initialData?.propertyId && properties.length > 0 && properties.some(p => p.id === initialData.propertyId)) {
          // Ensure properties are loaded and the initial property exists before setting
          setValue('propertyId', initialData.propertyId, { shouldDirty: false, shouldValidate: false });
      }
  }, [initialData?.propertyId, properties, setValue]); // Depend on properties list and initialData.propertyId


  // Fetch room types when property changes
  useEffect(() => {
    let isMounted = true;
    const fetchRoomTypes = async (propId: string) => {
      setRoomTypes([]); // Clear previous room types
      if (!propId) return;
      try {
        const response = await api.get<RoomType[]>(`/properties/${propId}/room-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
            setRoomTypes(response.data);
            // Set default room type if creating new and only one room type exists
            if (response.data.length === 1 && !initialData?.id) {
                setValue("roomTypeId", response.data[0].id);
            }
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
      }
    };

    // Trigger fetch if selectedPropertyId is valid
    if (token && selectedPropertyId) {
        fetchRoomTypes(selectedPropertyId);
    } else {
        // Clear room types if no property is selected
        setRoomTypes([]);
    }
    return () => { isMounted = false; };
  }, [token, selectedPropertyId, initialData?.id, setValue]); // Depend on selectedPropertyId

  // Effect to set roomTypeId *after* roomTypes are loaded and initialData is processed
  useEffect(() => {
      if (initialData?.roomTypeId && roomTypes.length > 0 && roomTypes.some(rt => rt.id === initialData.roomTypeId)) {
          // Ensure roomTypes are loaded for the correct property and the initial roomType exists
          setValue('roomTypeId', initialData.roomTypeId, { shouldDirty: false, shouldValidate: false });
      }
  }, [initialData?.roomTypeId, roomTypes, setValue]); // Depend on roomTypes list and initialData.roomTypeId

  // Submit handler using the inferred type from the refined schema
  const processSubmit: SubmitHandler<FormSchemaType> = (data) => {
    // No need for manual cleanup if using coerce and types match
    onSubmit(data, initialData?.id);
  };

  // Render helpers using the inferred type
  const renderInput = (name: keyof FormSchemaType, label: string, type: string = 'text') => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}{label.endsWith('*') ? '' : ' *'}</label>
      <input
        id={name}
        type={type}
        step={type === 'number' ? '0.01' : undefined} // Keep step for number inputs
        {...register(name)}
        className={`w-full px-sm py-xs border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm ${errors[name] ? 'border-error' : 'border-background-muted'}`}
      />
      {errors[name] && <p className="mt-1 text-xs text-error">{errors[name]?.message as string}</p>}
    </div>
  );

  const renderSelect = (name: keyof FormSchemaType, label: string, enumObject: Record<string, string>) => (
     <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}{label.endsWith('*') ? '' : ' *'}</label>
      <select
        id={name}
        {...register(name)}
        className={`w-full px-sm py-xs border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm bg-background ${errors[name] ? 'border-error' : 'border-background-muted'}`}
      >
        <option value="">-- Select --</option>
        {Object.values(enumObject).map((value) => (
          <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>
        ))}
      </select>
      {errors[name] && <p className="mt-1 text-xs text-error">{errors[name]?.message as string}</p>}
    </div>
  );

   const renderTextarea = (name: keyof FormSchemaType, label: string, rows: number = 3) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <textarea
        id={name}
        {...register(name)}
        rows={rows}
        className={`w-full px-sm py-xs border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm ${errors[name] ? 'border-error' : 'border-background-muted'}`}
      />
      {errors[name] && <p className="mt-1 text-xs text-error">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="p-6 bg-background rounded shadow-md">
      <h2 className="text-h3 font-semibold mb-6 text-text">{initialData?.id ? 'Edit Booking' : 'Create New Booking'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* Property & Room Type Selection */} 
        <div className="mb-4">
          <label htmlFor="propertyId" className="block text-sm font-medium text-text-secondary mb-1">Property *</label>
          <select
            id="propertyId"
            {...register("propertyId")}
            className={`w-full px-sm py-xs border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm bg-background ${errors.propertyId ? 'border-error' : 'border-background-muted'}`}
            disabled={!!initialData?.id} // Disable property change when editing
          >
            <option value="">-- Select Property --</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>{prop.name}</option>
            ))}
          </select>
          {errors.propertyId && <p className="mt-1 text-xs text-error">{errors.propertyId?.message as string}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="roomTypeId" className="block text-sm font-medium text-text-secondary mb-1">Room Type</label>
          <select
            id="roomTypeId"
            {...register("roomTypeId")}
            className={`w-full px-sm py-xs border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm bg-background ${errors.roomTypeId ? 'border-error' : 'border-background-muted'}`}
            disabled={!selectedPropertyId || roomTypes.length === 0}
          >
            <option value="">-- Select Room Type --</option>
            {roomTypes.map(rt => (
              <option key={rt.id} value={rt.id}>{rt.name} (Occupancy: {rt.occupancy}, Price: {rt.price})</option>
            ))}
          </select>
          {errors.roomTypeId && <p className="mt-1 text-xs text-error">{errors.roomTypeId?.message as string}</p>}
        </div>

        {/* Guest Info */} 
        <h3 className="text-h4 font-medium mb-3 text-text md:col-span-2">Guest Information</h3>
        {renderInput('guestName', 'Guest Name *')}
        {renderInput('contactPhone', 'Contact Phone *')}
        {renderInput('contactEmail', 'Contact Email', 'email')}
        {renderSelect('channel', 'Booking Channel *', Channel)}
        {renderInput('reference', 'Channel Reference / Code')}

        {/* Stay Details */} 
        <h3 className="text-h4 font-medium mb-3 mt-4 text-text md:col-span-2">Stay Details</h3>
        {renderInput('checkIn', 'Check-in Date *', 'date')}
        {renderInput('checkOut', 'Check-out Date *', 'date')}
        {renderInput('adults', 'Adults *', 'number')}
        {renderInput('children', 'Children', 'number')}
        {renderTextarea('specialRequests', 'Special Requests')}

        {/* Financials */} 
        <h3 className="text-h4 font-medium mb-3 mt-4 text-text md:col-span-2">Financials</h3>
        {renderInput('totalAmount', 'Total Amount *', 'number')}
        {renderInput('commission', 'Commission', 'number')}
        {renderInput('currency', 'Currency')}
        {renderSelect('paymentMethod', 'Payment Method *', PaymentMethod)}
        {renderInput('paymentChannel', 'Payment Channel')}
        {renderSelect('paymentStatus', 'Payment Status', PaymentStatus)}
        {renderInput('amountPaid', 'Amount Paid', 'number')}
        {renderInput('refundedAmount', 'Refunded Amount', 'number')}
        {renderInput('invoiceUrl', 'Invoice URL', 'url')}

        {/* Deposit */} 
        <h3 className="text-h4 font-medium mb-3 mt-4 text-text md:col-span-2">Deposit</h3>
        {renderInput('depositAmount', 'Deposit Amount', 'number')}
        {renderInput('depositDate', 'Deposit Date', 'date')}
        {renderSelect('depositMethod', 'Deposit Method', DepositMethod)}
        {renderSelect('depositStatus', 'Deposit Status', DepositStatus)}

        {/* Internal */} 
        <h3 className="text-h4 font-medium mb-3 mt-4 text-text md:col-span-2">Internal</h3>
        {renderInput('assignedStaff', 'Assigned Staff')}
        {renderTextarea('internalNotes', 'Internal Notes')}
        {renderSelect('bookingStatus', 'Booking Status', BookingStatus)}
      </div>

      {/* Actions */} 
      <div className="flex justify-end mt-6 space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {initialData?.id ? 'Update Booking' : 'Create Booking'}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;

