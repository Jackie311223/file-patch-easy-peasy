import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/axios'; // Giả sử apiClient là default export từ src/api/axios.ts

// Sửa import Button thành named import
import { Button } from '@/ui/Button'; 
import ErrorState from '@/ui/ErrorState'; // ErrorState.tsx có export default, import này đúng
// Sửa import Spinner thành LoadingSpinner (named import)
import { LoadingSpinner } from '@/ui/Loading/Spinner'; 
// Cân nhắc đưa các type này ra file dùng chung nếu được sử dụng ở nhiều nơi
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

interface Booking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  roomTypeId: string;
  roomTypeName: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Thêm các trường khác nếu API trả về
}

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Sử dụng hook useNavigate
  
  const { data: booking, isLoading, error, refetch } = useQuery<Booking, Error>({ // Thêm Error type cho useQuery
    queryKey: ['booking', id],
    queryFn: async () => {
      if (!id) throw new Error("Booking ID is required"); // Thêm kiểm tra id
      const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
      return data;
    },
    enabled: !!id, // Query chỉ chạy khi có id
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner /> {/* Sử dụng LoadingSpinner */}
      </div>
    );
  }

  if (error || !booking) {
    return (
      <ErrorState 
        title="Could not load booking details" 
        message={error?.message || "The requested booking was not found or an error occurred."} // Cải thiện message
        onRetry={() => refetch()} // Gọi refetch thay vì reload trang
      />
    );
  }

  // Hàm định dạng ngày tháng (có thể chuyển vào utils nếu dùng nhiều nơi)
  const formatDateDisplay = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-GB', { // Sử dụng en-GB cho dd/mm/yyyy hoặc tùy chỉnh
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            // weekday: 'long', month: 'long', // Bỏ nếu muốn format ngắn gọn hơn
        });
    } catch (e) {
        return "Invalid Date";
    }
  };
  
  // Hàm định dạng tiền tệ (có thể chuyển vào utils/formatters)
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  }


  const getStatusClasses = (status: BookingStatus): string => { // Đổi tên hàm và thêm type cho return
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'CHECKED_OUT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Booking Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)}> {/* Sử dụng navigate(-1) để quay lại */}
            Back
          </Button>
          {/* <Button variant="primary">Edit Booking</Button>  */}
          {/* Thêm nút Edit nếu cần */}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex flex-wrap justify-between items-center gap-2"> {/* Thêm flex-wrap và gap */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Booking <span className="text-primary">#{booking.id.substring(0,8)}...</span> {/* Rút gọn ID nếu quá dài */}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Created on {formatDateDisplay(booking.createdAt)}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(booking.status)}`}> {/* Tăng padding và giảm text size */}
            {booking.status.replace('_', ' ').toUpperCase()} {/* Format status text */}
          </span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            {/* Guest Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Guest name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{booking.guestName}</dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{booking.email}</dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{booking.phone}</dd>
            </div>

            {/* Booking Details */}
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-in date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{formatDateDisplay(booking.checkInDate)}</dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-out date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{formatDateDisplay(booking.checkOutDate)}</dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Room type</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{booking.roomTypeName}</dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total amount</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold sm:mt-0 sm:col-span-2">{formatCurrency(booking.totalAmount)}</dd> {/* Sử dụng formatCurrency */}
            </div>
            {booking.notes && (
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 whitespace-pre-wrap">{booking.notes}</dd>
              </div>
            )}
             <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last updated</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{formatDateDisplay(booking.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;