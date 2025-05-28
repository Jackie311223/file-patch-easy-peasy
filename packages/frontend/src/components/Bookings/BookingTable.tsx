import React from 'react';
import { Booking, BookingStatus, PaymentStatus } from '../../types/booking';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

interface BookingTableProps {
  bookings: Booking[];
  isLoading?: boolean;
  onViewDetails: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  showPropertyColumn?: boolean; // Added to match usage in BookingsPage
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  isLoading = false,
  onViewDetails,
  onEdit,
  onDelete,
  showPropertyColumn = true // Default to true to maintain backward compatibility
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case BookingStatus.NO_SHOW:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PARTIALLY_PAID:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.UNPAID:
        return 'bg-red-100 text-red-800';
      case PaymentStatus.REFUNDED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No bookings found. Try adjusting your filters or create a new booking.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Guest
            </th>
            {showPropertyColumn && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dates
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                <div className="text-sm text-gray-500">{booking.contactPhone}</div>
              </td>
              {showPropertyColumn && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.property ? (
                    <Link 
                      to={`/properties/${booking.propertyId}`} 
                      className="text-sm text-primary hover:text-primary-dark hover:underline"
                    >
                      {booking.property.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-500">Unknown Property</span>
                  )}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                {booking.roomType ? (
                  <span className="text-sm text-gray-900">{booking.roomType.name}</span>
                ) : (
                  <span className="text-sm text-gray-500">Not specified</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(booking.checkIn)}</div>
                <div className="text-sm text-gray-500">to {formatDate(booking.checkOut)}</div>
                <div className="text-xs text-gray-500">{booking.nights} nights</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus.replace(/_/g, ' ')}
                </span>
                <div className="text-xs text-gray-500 mt-1">{booking.paymentMethod.replace(/_/g, ' ')}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{formatCurrency(booking.totalAmount, booking.currency)}</div>
                {booking.outstandingBalance > 0 && (
                  <div className="text-xs text-red-600">
                    Due: {formatCurrency(booking.outstandingBalance, booking.currency)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => onViewDetails(booking)}
                    variant="secondary"
                    size="small"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => onEdit(booking)}
                    variant="primary"
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDelete(booking)}
                    variant="destructive"
                    size="small"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
