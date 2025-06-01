import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import apiClient from "./axios";

// Định nghĩa kiểu dữ liệu Booking
export interface Booking {
  id: string;
  bookingCode: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  propertyId: string;
  roomId?: string;
  totalAmount?: number;
  // Thêm các trường khác nếu cần
}

// Định nghĩa kiểu dữ liệu trả về khi lấy danh sách bookings
export interface BookingsResponse {
  data: Booking[];
  total: number;
}

// Tham số khi lấy danh sách bookings
export interface GetBookingsParams {
  propertyId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  guestName?: string;
  page?: number;
  limit?: number;
}

// Định nghĩa kiểu dữ liệu User
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Định nghĩa kiểu dữ liệu trả về khi lấy danh sách users
export interface UsersResponse {
  data: User[];
  total: number;
}

// Lấy danh sách bookings từ API
export const getBookings = async (params: GetBookingsParams = {}): Promise<BookingsResponse> => {
  const response = await apiClient.get<BookingsResponse>("/bookings", { params });
  return response.data;
};

// Lấy danh sách users từ API
export const getUsers = async (params: any = {}): Promise<UsersResponse> => {
  const response = await apiClient.get<UsersResponse>("/users", { params });
  return response.data;
};

// --- React Query Hooks ---

export const useGetBookings = (params?: GetBookingsParams) => {
  return useQuery<BookingsResponse, Error>({
    queryKey: ["bookings", params],
    queryFn: () => getBookings(params),
  });
};

export const useGetUsers = (params?: any): UseQueryResult<UsersResponse, Error> => {
  return useQuery<UsersResponse, Error>({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};

// --- Mutations ---

// Tạo mới booking
export const createBooking = async (bookingData: any): Promise<Booking> => {
  const response = await apiClient.post<Booking>("/bookings", bookingData);
  return response.data;
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, any>({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};