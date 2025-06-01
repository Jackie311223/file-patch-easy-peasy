import apiClient from './axios';

// Định nghĩa các kiểu dữ liệu
export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentType: 'OTA_COLLECT' | 'HOTEL_COLLECT';
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  bookingId: string;
  amount: number;
  commission: number;
  netRevenue: number;
}

export interface Booking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  paymentType: 'OTA_COLLECT' | 'HOTEL_COLLECT';
  isInvoiced: boolean;
}

export interface CreateInvoiceDto {
  bookingIds: string[];
  paymentType: 'OTA_COLLECT' | 'HOTEL_COLLECT';
  notes?: string;
}

export interface UpdateInvoiceStatusDto {
  status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'CANCELLED';
}

export interface GetInvoicesParams {
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'CANCELLED';
  paymentType?: 'OTA_COLLECT' | 'HOTEL_COLLECT';
}

export interface GetBookingsParams {
  isInvoiced?: boolean;
  paymentType?: 'OTA_COLLECT' | 'HOTEL_COLLECT';
}

// Đường dẫn API
const API_BASE = '/finance';
const BOOKING_API_BASE = '/bookings';

export const financeApi = {
  getInvoices: async (params: GetInvoicesParams = {}): Promise<Invoice[]> => {
    const response = await apiClient.get<Invoice[]>(`${API_BASE}/invoices`, { params });
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(`${API_BASE}/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(`${API_BASE}/invoices`, data);
    return response.data;
  },

  updateInvoiceStatus: async (id: string, data: UpdateInvoiceStatusDto): Promise<Invoice> => {
    const response = await apiClient.patch<Invoice>(`${API_BASE}/invoices/${id}`, data);
    return response.data;
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/invoices/${id}`);
  },

  getUninvoicedBookings: async (params: GetBookingsParams): Promise<Booking[]> => {
    const queryParams = { ...params, isInvoiced: false };
    const response = await apiClient.get<Booking[]>(`${BOOKING_API_BASE}`, { params: queryParams });
    return response.data;
  },
};