import React, { useState } from 'react';
import { format } from 'date-fns';
import Dialog from '@/ui/Dialog';

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

interface BookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedBooking: Booking) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ booking, isOpen, onClose, onUpdate }) => {
  // Local state for form
  const [formData, setFormData] = useState<Booking>({...booking});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Status options
  const statusOptions = [
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'CHECKED_OUT', label: 'Checked Out' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
      return;
    }
    
    // Handle date inputs
    if (type === 'date') {
      setFormData(prev => ({ ...prev, [name]: value }));
      return;
    }
    
    // Handle other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Calculate nights based on check-in and check-out dates
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const updatedBooking = {
      ...formData,
      nights,
    };
    
    onUpdate(updatedBooking);
    setIsSubmitting(false);
  };
  
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Booking"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Guest Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900">Guest Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
                  Guest Name
                </label>
                <input
                  type="text"
                  id="guestName"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center h-5">
                  <input
                    id="isVIP"
                    name="isVIP"
                    type="checkbox"
                    checked={formData.isVIP || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="isVIP" className="font-medium text-gray-700">
                    VIP Guest
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Details */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">
                  Check-in Date
                </label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={typeof formData.checkIn === 'string' ? formData.checkIn : format(formData.checkIn, 'yyyy-MM-dd')}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">
                  Check-out Date
                </label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={typeof formData.checkOut === 'string' ? formData.checkOut : format(formData.checkOut, 'yyyy-MM-dd')}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <input
                  type="text"
                  id="roomName"
                  name="roomName"
                  value={formData.roomName}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                  disabled
                />
              </div>
              
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                  Source
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="totalAmount"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default BookingModal;
