// src/api/invoicesApi.ts

import apiClient from "@/api/axios"; // Default import từ axios.ts
import { useQuery, useMutation, UseQueryResult, UseMutationResult, QueryKey } from "@tanstack/react-query";

// Định nghĩa kiểu dữ liệu Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: "DRAFT" | "SENT" | "PAID" | "VOID";
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
  propertyId?: string;
  bookingId?: string;
  booking?: {
    bookingCode?: string;
    guestName?: string;
  };
}

// Cấu trúc response khi lấy danh sách invoice
export interface InvoicesResponse {
  data: Invoice[];
  total: number;
}

// Payload tạo invoice
interface CreateInvoicePayload {
  paymentIds: string[];
}

// Hàm gọi API lấy invoices
export const getInvoices = async (
  tenantId: string,
  params?: Record<string, any>
): Promise<InvoicesResponse> => {
  const response = await apiClient.get<InvoicesResponse>(`/tenants/${tenantId}/invoices`, { params });
  return response.data;
};

// Hàm gọi API tạo invoice
export const createInvoice = async (payload: CreateInvoicePayload): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>(`/invoices`, payload);
  return response.data;
};

// Hàm gọi API xóa invoice
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  await apiClient.delete(`/invoices/${invoiceId}`);
};

// Hook React Query để lấy invoices
export const useGetInvoices = (
  tenantId: string,
  params?: Record<string, any>
): UseQueryResult<InvoicesResponse, Error> => {
  return useQuery<InvoicesResponse, Error>({
    queryKey: ["invoices", tenantId, params] as QueryKey,
    queryFn: () => getInvoices(tenantId, params),
    enabled: Boolean(tenantId),
    staleTime: 5 * 60 * 1000,  // 5 phút
  });
};

// Hook React Query để tạo invoice
export const useCreateInvoice = (): UseMutationResult<Invoice, Error, CreateInvoicePayload> => {
  return useMutation<Invoice, Error, CreateInvoicePayload>({
    mutationFn: createInvoice,
    onSuccess: () => {
      // Tự động refetch danh sách invoices sau khi tạo thành công
      // queryClient.invalidateQueries(["invoices"]);
    },
  });
};

// Hook React Query để xóa invoice
export const useDeleteInvoice = (): UseMutationResult<void, Error, string> => {
  return useMutation<void, Error, string>({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      // Tự động refetch sau khi xóa
      // queryClient.invalidateQueries(["invoices"]);
    },
  });
};
