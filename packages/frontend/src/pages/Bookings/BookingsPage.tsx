// src/pages/Bookings/BookingsPage.tsx

import { useState, useEffect } from "react";
import apiClient from "@/api/axios";
import { useAuth } from "@/hooks/useAuth"; // Đã sửa import path thành alias @

// Định nghĩa kiểu Booking (tùy chỉnh theo API thực tế)
interface Booking {
  id: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  // Thêm các trường khác nếu cần
}

const BookingsPage = () => {
  const { token } = useAuth(); // Lấy token, useAuth sẽ redirect nếu chưa login
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<Booking[]>("/bookings");
        setBookings(response.data || []);
      } catch (err: any) {
        console.error("Failed to fetch bookings:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch bookings"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  if (isLoading) {
    return (
      <div className="text-center p-4">
        Loading bookings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-out
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.propertyName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.guestName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
