import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axios"; // Giả sử apiClient đã được cấu hình đúng

// Định nghĩa kiểu dữ liệu Payment (nguồn đáng tin cậy cho type Payment)
export interface Payment {
  id: string;
  booking: { 
    id: string; // Thường thì booking cũng có id riêng
    bookingCode: string; 
    guestName: string 
  };
  amount: number;
  method: string;
  paymentDate: string; // Nên là string dạng YYYY-MM-DD hoặc ISO string
  status: string; // Nên là một union type cụ thể, ví dụ: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID'
  paymentType: "HOTEL_COLLECT" | "OTA_COLLECT";
  collectedBy?: { id: string; name: string };
  receivedFrom?: string;
  notes?: string;
  createdAt?: string; // Thêm nếu API trả về
  updatedAt?: string; // Thêm nếu API trả về
}

// Định nghĩa kiểu dữ liệu trả về khi lấy danh sách payments
export interface PaymentsResponse {
  data: Payment[];
  total: number;
  page?: number;    // Thêm nếu API trả về
  limit?: number;   // Thêm nếu API trả về
  totalPages?: number; // Thêm nếu API trả về
}

// Tham số cho việc lấy danh sách payments
export interface GetPaymentsParams {
  propertyId?: string;
  status?: string;
  method?: string;
  ownerId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  paymentType?: "HOTEL_COLLECT" | "OTA_COLLECT";
  page?: number;
  limit?: number;
  bookingId?: string;
  // Thêm các params khác nếu API hỗ trợ
}

// Dữ liệu để tạo mới Payment
// Dựa trên PaymentFormData nhưng loại bỏ các trường không cần thiết cho việc tạo mới
// và chuyển đổi paymentDate thành string.
export interface CreatePaymentPayload {
  bookingId: string;
  amount: number;
  method: string;
  paymentDate: string; // Format YYYY-MM-DD hoặc ISO string
  notes?: string;
  paymentType: "HOTEL_COLLECT" | "OTA_COLLECT";
  collectedById?: string; // Bắt buộc nếu paymentType là HOTEL_COLLECT
  receivedFrom?: string;  // Bắt buộc nếu paymentType là OTA_COLLECT
  tenantId?: string;    // Thêm nếu API yêu cầu
}

// Dữ liệu để cập nhật Payment (thường là Partial của CreatePaymentPayload)
export interface UpdatePaymentPayload extends Partial<Omit<CreatePaymentPayload, 'tenantId' | 'bookingId'>> {
  // bookingId thường không được phép thay đổi khi update payment
}


// --- API Functions ---

// Lấy danh sách payments từ API
export const getPayments = async (params: GetPaymentsParams = {}): Promise<PaymentsResponse> => {
  const response = await apiClient.get<PaymentsResponse>("/payments", { params });
  return response.data;
};

// Tạo mới payment
export const createPayment = async (paymentData: CreatePaymentPayload): Promise<Payment> => {
  const response = await apiClient.post<Payment>("/payments", paymentData);
  return response.data;
};

// Cập nhật toàn bộ payment (PUT) hoặc một phần (PATCH)
// Thêm hàm updatePayment để hoàn thiện CRUD
export const updatePayment = async (paymentId: string, paymentData: UpdatePaymentPayload): Promise<Payment> => {
  // Sử dụng PATCH nếu chỉ cập nhật một phần, PUT nếu cập nhật toàn bộ
  const response = await apiClient.patch<Payment>(`/payments/${paymentId}`, paymentData); 
  return response.data;
};


// Cập nhật trạng thái payment
export const updatePaymentStatusApi = async ({
  paymentId,
  status,
}: {
  paymentId: string;
  status: string; // status nên là một union type cụ thể
}): Promise<Payment> => {
  const response = await apiClient.patch<Payment>(`/payments/${paymentId}/status`, { status });
  return response.data;
};

// Xóa payment
export const deletePaymentApi = async (paymentId: string): Promise<void> => {
  await apiClient.delete(`/payments/${paymentId}`);
};

// --- React Query Hooks ---

export const useGetPayments = (params?: GetPaymentsParams) => {
  return useQuery<PaymentsResponse, Error, PaymentsResponse, readonly unknown[]>({ // Thêm kiểu cho queryKey
    queryKey: ["payments", params || {}], // Đảm bảo params là object ổn định hoặc được serialize
    queryFn: () => getPayments(params || {}),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Payment, Error, CreatePaymentPayload>({ // Sử dụng CreatePaymentPayload
    mutationFn: createPayment,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      // Có thể thực hiện các hành động khác, ví dụ:
      // queryClient.setQueryData(['payment', data.id], data);
    },
    // onError, onMutate có thể được thêm ở đây
  });
};

// Hook để cập nhật payment
export const useUpdatePayment = () => {
    const queryClient = useQueryClient();
    return useMutation<Payment, Error, { id: string; data: UpdatePaymentPayload }>({
        mutationFn: (vars) => updatePayment(vars.id, vars.data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["payment", variables.id] }); // Invalidate chi tiết payment
        },
    });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<Payment, Error, { paymentId: string; status: string }>({
    mutationFn: updatePaymentStatusApi,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", variables.paymentId] });
    },
  });
};

export const useDeletePayment = (onSuccessCallback?: () => void) => { // Cho phép truyền callback nếu cần
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({ // string là paymentId
    mutationFn: deletePaymentApi,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
};