import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Booking, BookingStatus, PaymentStatus } from '../../types/booking';
import Button from './Button';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null | undefined; // Updated to accept undefined as well
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: booking.currency || 'VND',
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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container for centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Booking Details
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Guest Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Guest Name:</span>
                    <p className="text-sm text-gray-900">{booking.guestName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Contact Phone:</span>
                    <p className="text-sm text-gray-900">{booking.contactPhone}</p>
                  </div>
                  {booking.contactEmail && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contact Email:</span>
                      <p className="text-sm text-gray-900">{booking.contactEmail}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Booking Channel:</span>
                    <p className="text-sm text-gray-900">{booking.channel}</p>
                  </div>
                  {booking.reference && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Reference:</span>
                      <p className="text-sm text-gray-900">{booking.reference}</p>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Stay Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Property:</span>
                    <p className="text-sm text-gray-900">{booking.property?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Room Type:</span>
                    <p className="text-sm text-gray-900">{booking.roomType?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Check-in:</span>
                    <p className="text-sm text-gray-900">{formatDate(booking.checkIn)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Check-out:</span>
                    <p className="text-sm text-gray-900">{formatDate(booking.checkOut)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nights:</span>
                    <p className="text-sm text-gray-900">{booking.nights}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Guests:</span>
                    <p className="text-sm text-gray-900">{booking.adults} adults, {booking.children} children</p>
                  </div>
                  {booking.specialRequests && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Special Requests:</span>
                      <p className="text-sm text-gray-900">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Booking Status</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)} ml-2`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created:</span>
                    <p className="text-sm text-gray-900">{formatDate(booking.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                    <p className="text-sm text-gray-900">{formatDate(booking.updatedAt)}</p>
                  </div>
                  {booking.assignedStaff && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Assigned Staff:</span>
                      <p className="text-sm text-gray-900">{booking.assignedStaff}</p>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Financial Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                  {booking.commission !== null && booking.commission !== undefined && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Commission:</span>
                      <p className="text-sm text-gray-900">{formatCurrency(booking.commission)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Net Revenue:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(booking.netRevenue)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                    <p className="text-sm text-gray-900">{booking.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Payment Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)} ml-2`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Amount Paid:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(booking.amountPaid)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Outstanding Balance:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(booking.outstandingBalance)}</p>
                  </div>
                  {booking.refundedAmount !== null && booking.refundedAmount !== undefined && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Refunded Amount:</span>
                      <p className="text-sm text-gray-900">{formatCurrency(booking.refundedAmount)}</p>
                    </div>
                  )}
                </div>

                {/* Deposit section if applicable */}
                {booking.depositAmount && (
                  <>
                    <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Deposit Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Deposit Amount:</span>
                        <p className="text-sm text-gray-900">{formatCurrency(booking.depositAmount)}</p>
                      </div>
                      {booking.depositDate && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Deposit Date:</span>
                          <p className="text-sm text-gray-900">{formatDate(booking.depositDate)}</p>
                        </div>
                      )}
                      {booking.depositMethod && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Deposit Method:</span>
                          <p className="text-sm text-gray-900">{booking.depositMethod}</p>
                        </div>
                      )}
                      {booking.depositStatus && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Deposit Status:</span>
                          <p className="text-sm text-gray-900">{booking.depositStatus}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Internal notes if applicable */}
                {booking.internalNotes && (
                  <>
                    <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Internal Notes</h3>
                    <p className="text-sm text-gray-900 whitespace-pre-line">{booking.internalNotes}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BookingDetailModal;
