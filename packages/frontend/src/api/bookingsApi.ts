import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import apiClient from "./axios";

// Define Booking type (adjust based on actual data structure)
export interface Booking { // Export interface
  id: string;
  bookingCode: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  propertyId: string;
  roomId?: string; // Optional room ID
  totalAmount?: number; // Optional total amount
  // Add other relevant fields
}

// Define expected response structure for getBookings
export interface BookingsResponse { // Export interface
  data: Booking[];
  total: number;
  // Add other pagination/metadata if available
}

export interface GetBookingsParams { // Export interface
  propertyId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  guestName?: string;
  page?: number;
  limit?: number;
}

// Define User type (adjust based on actual data structure)
export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Example role
  // Add other relevant fields
}

// Define expected response structure for getUsers
export interface UsersResponse {
  data: User[];
  total: number;
}

// Mock function to get bookings
export const getBookings = async (params: GetBookingsParams = {}): Promise<BookingsResponse> => {
  console.log("Mock getBookings called with params:", params);
  // In a real app, fetch from `${config.apiUrl}/bookings` with query params
  // const response = await apiClient.get<BookingsResponse>("/bookings", { params });
  // return response.data;

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 100));
  const mockBookings: Booking[] = [
    { id: "bk1", bookingCode: "BK001", guestName: "Alice", checkInDate: "2024-06-01", checkOutDate: "2024-06-05", status: "CONFIRMED", propertyId: "prop1" },
    { id: "bk2", bookingCode: "BK002", guestName: "Bob", checkInDate: "2024-06-10", checkOutDate: "2024-06-12", status: "PENDING", propertyId: "prop1" },
    { id: "bk3", bookingCode: "BK003", guestName: "Charlie", checkInDate: "2024-06-15", checkOutDate: "2024-06-20", status: "CONFIRMED", propertyId: "prop2" },
  ];

  // Simple mock filtering (adjust as needed)
  let filteredBookings = mockBookings;
  if (params.status) {
    filteredBookings = filteredBookings.filter(b => b.status === params.status);
  }
  // Add other filters if needed

  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredBookings.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total: filteredBookings.length,
  };
};

// Mock function to get users (e.g., staff for assigning tasks or payments)
export const getUsers = async (params: any = {}): Promise<UsersResponse> => {
  console.log("Mock getUsers called with params:", params);
  // In a real app, fetch from `/users` endpoint
  // const response = await apiClient.get<UsersResponse>("/users", { params });
  // return response.data;

  await new Promise(resolve => setTimeout(resolve, 100));
  const mockUsers: User[] = [
    { id: "user1", name: "Staff Member 1", email: "staff1@example.com", role: "STAFF" },
    { id: "user2", name: "Staff Member 2", email: "staff2@example.com", role: "STAFF" },
    { id: "user3", name: "Admin User", email: "admin@example.com", role: "ADMIN" },
  ];
  return { data: mockUsers, total: mockUsers.length };
};

// --- React Query Hooks ---

export const useGetBookings = (params?: GetBookingsParams) => {
  return useQuery<BookingsResponse, Error>({
    queryKey: ["bookings", params], // Include params in queryKey
    queryFn: () => getBookings(params),
  });
};

// Hook to fetch users
export const useGetUsers = (params?: any): UseQueryResult<UsersResponse, Error> => {
  return useQuery<UsersResponse, Error>({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};

// --- Mutations (Add if needed, e.g., createBooking, updateBookingStatus) ---

// Example: Mock function to create a booking
export const createBooking = async (bookingData: any): Promise<Booking> => {
  console.log("Mock createBooking called with data:", bookingData);
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ...bookingData, id: `new_booking_${Date.now()}`, status: "PENDING" };
};

// Example: React Query Hook for creating a booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, any>({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

