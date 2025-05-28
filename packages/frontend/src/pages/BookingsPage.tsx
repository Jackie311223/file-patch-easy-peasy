import { useState, useEffect } from 'react';
import apiClient from '@/api/axios';
import { useAuth } from '../hooks/useAuth'; // Assuming useAuth handles redirect if not logged in

// Define a type for the booking data (adjust based on your actual API response)
interface Booking {
  id: string;
  propertyName: string; // Example field
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  // Add other relevant booking fields
}

const BookingsPage = () => {
  const { token } = useAuth(); // Get token to ensure user is logged in
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        // Although useAuth might handle redirects, double-check here
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Adjust the endpoint '/bookings' if needed
        const response = await apiClient.get('/bookings');
        // Adjust data access based on your API response structure
        setBookings(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch bookings:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token]); // Re-fetch if token changes (e.g., after login)

  if (isLoading) {
    return <div className="text-center p-4">Loading bookings...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                {/* Add other headers as needed */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.propertyName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.guestName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                  {/* Render other booking data cells */}
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
