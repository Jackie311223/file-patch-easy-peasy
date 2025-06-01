import apiClient from "./axios";
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult, QueryKey, keepPreviousData } from "@tanstack/react-query"; // Thêm keepPreviousData

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
    id?: string; 
    bookingCode?: string;
    guestName?: string;
  };
}

// Cấu trúc response khi lấy danh sách invoice
export interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Tham số cho việc lấy danh sách invoice (cho useGetInvoices)
export interface GetInvoicesParams {
  propertyId?: string;
  status?: Invoice['status'] | string; 
  startDate?: string; 
  endDate?: string;   
  page?: number;
  limit?: number;
  bookingId?: string;
}


// Payload tạo invoice
export interface CreateInvoicePayload {
  bookingId: string;
  dueDate: string; 
  status: "DRAFT" | "SENT" | "PAID" | "VOID"; 
  notes?: string;
  paymentIds: string[]; 
  tenantId?: string; 
  propertyId?: string; 
}

// Payload để cập nhật invoice
export interface UpdateInvoicePayload extends Partial<Omit<CreateInvoicePayload, 'bookingId' | 'tenantId' | 'propertyId'>> {
  // bookingId, tenantId, propertyId thường không thay đổi khi update
}


// --- API Functions ---

export const getInvoices = async (
  params?: GetInvoicesParams 
): Promise<InvoicesResponse> => {
  const response = await apiClient.get<InvoicesResponse>(`/invoices`, { params });
  return response.data;
};

export const createInvoice = async (payload: CreateInvoicePayload): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>(`/invoices`, payload);
  return response.data;
};

export const updateInvoice = async (invoiceId: string, payload: UpdateInvoicePayload): Promise<Invoice> => {
    const response = await apiClient.patch<Invoice>(`/invoices/${invoiceId}`, payload);
    return response.data;
};

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  await apiClient.delete(`/invoices/${invoiceId}`);
};

// --- React Query Hooks ---

export const useGetInvoices = (
  params?: GetInvoicesParams, // Sửa: Sử dụng GetInvoicesParams
): UseQueryResult<InvoicesResponse, Error> => {
  return useQuery<InvoicesResponse, Error, InvoicesResponse, QueryKey>({ 
    queryKey: ["invoices", params || {}] as QueryKey, 
    queryFn: () => getInvoices(params), 
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData, // Sửa: Sử dụng placeholderData với keepPreviousData
  });
};

export const useCreateInvoice = (onSuccessCallback?: (data: Invoice) => void) => {
  const queryClient = useQueryClient();
  return useMutation<Invoice, Error, CreateInvoicePayload>({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
  });
};

export const useUpdateInvoice = (onSuccessCallback?: (data: Invoice) => void) => {
    const queryClient = useQueryClient();
    return useMutation<Invoice, Error, { id: string; payload: UpdateInvoicePayload }>({
        mutationFn: (vars) => updateInvoice(vars.id, vars.payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
            if (onSuccessCallback) {
                onSuccessCallback(data);
            }
        },
    });
};

export const useDeleteInvoice = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({ 
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
};