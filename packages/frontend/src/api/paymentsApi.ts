import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axios"; // Assuming axios instance is configured

// Define Payment type (adjust based on actual data structure)
export interface Payment { // Export interface
  id: string;
  booking: { bookingCode: string; guestName: string };
  amount: number;
  method: string;
  paymentDate: string;
  status: string;
  paymentType: "HOTEL_COLLECT" | "OTA_COLLECT";
  collectedBy?: { id: string; name: string }; // Add optional collector info
  receivedFrom?: string; // Add optional source info
  notes?: string; // Add optional notes field
  // Add other relevant fields
}

// Define the expected response structure for getPayments
export interface PaymentsResponse { // Export interface
  data: Payment[];
  total: number;
  // Add other pagination/metadata if available
}

export interface GetPaymentsParams { // Export interface
  propertyId?: string;
  status?: string;
  method?: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
  paymentType?: "HOTEL_COLLECT" | "OTA_COLLECT";
  page?: number;
  limit?: number;
  bookingId?: string; // Add bookingId here
}

// Mock function to get payments, returning the correct structure
export const getPayments = async (params: GetPaymentsParams = {}): Promise<PaymentsResponse> => {
  console.log("Mock getPayments called with params:", params);
  // In a real app, fetch from `${config.apiUrl}/payments` with query params
  // const response = await apiClient.get<PaymentsResponse>("/payments", { params });
  // return response.data;

  // Mock implementation returning the expected structure
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  const mockPayments: Payment[] = [
    // Add some mock payment data if needed for testing
    { id: "pay1", booking: { bookingCode: "BK001", guestName: "Alice" }, amount: 100, method: "CASH", paymentDate: "2024-05-28", status: "PAID", paymentType: "HOTEL_COLLECT", collectedBy: { id: "user1", name: "Admin" } },
    { id: "pay2", booking: { bookingCode: "BK002", guestName: "Bob" }, amount: 200, method: "OTA_TRANSFER", paymentDate: "2024-05-29", status: "UNPAID", paymentType: "OTA_COLLECT", receivedFrom: "Booking.com" },
    { id: "pay3", booking: { bookingCode: "BK001", guestName: "Alice" }, amount: 50, method: "MOMO", paymentDate: "2024-05-30", status: "UNPAID", paymentType: "HOTEL_COLLECT", collectedBy: { id: "user2", name: "Staff" } },
  ];
  // Simple mock pagination/filtering (adjust as needed)
  let filteredPayments = mockPayments;
  if (params.bookingId) {
    // Corrected syntax: added closing parenthesis for includes()
    filteredPayments = filteredPayments.filter(p => (p.booking.bookingCode.includes(params.bookingId || "")) || p.id === params.bookingId); // Allow filtering by booking ID or code
  }
  if (params.status) {
     filteredPayments = filteredPayments.filter(p => p.status === params.status);
  }
  // Add other filters if needed

  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredPayments.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total: filteredPayments.length, // Total count before pagination
  };
};

// --- Mutations (Keep existing or add as needed) ---

// Mock function to create a payment
export const createPayment = async (paymentData: any): Promise<any> => {
  console.log("Mock createPayment called with data:", paymentData);
  // In a real app, POST to `${config.apiUrl}/payments`
  // const response = await apiClient.post("/payments", paymentData);
  // return response.data;
  await new Promise(resolve => setTimeout(resolve, 100));
  // Return a mock response
  return { ...paymentData, id: `new_payment_${Date.now()}` }; 
};

// Mock function to update payment status
export const updatePaymentStatusApi = async ({ paymentId, status }: { paymentId: string; status: string }): Promise<any> => {
  console.log(`Mock updatePaymentStatusApi called for ID: ${paymentId}, Status: ${status}`);
  await new Promise(resolve => setTimeout(resolve, 100));
  return { id: paymentId, status }; // Return mock updated data
};

// Mock function to delete a payment
export const deletePaymentApi = async (paymentId: string): Promise<void> => {
  console.log(`Mock deletePaymentApi called for ID: ${paymentId}`);
  await new Promise(resolve => setTimeout(resolve, 100));
  // No return value needed for delete
};

// --- React Query Hooks for Mutations (Keep existing or add as needed) ---

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { paymentId: string; status: string }>({
    mutationFn: updatePaymentStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    // Add onError handling if needed
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePaymentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    // Add onError handling if needed
  });
};

