import axios from 'axios';

// Assume axios is configured with baseURL and auth headers elsewhere
// Example:
// axios.defaults.baseURL = '/api'; // Or your backend URL
// axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Define types (ideally imported from finance.ts)
interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // ISO Date string
  paymentType: 'OTA_COLLECT' | 'HOTEL_COLLECT';
  totalAmount: number; // Or string if using Decimal representation
  status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'CANCELLED';
  notes?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  items: InvoiceItem[];
  // Add other fields as needed
}

interface InvoiceItem {
  id: string;
  bookingId: string;
  amount: number; // Or string
  commission: number; // Or string
  netRevenue: number; // Or string
  // Add booking details if needed/included in response
}

interface Booking {
    id: string;
    guestName: string;
    checkIn: string; // ISO Date string
    checkOut: string; // ISO Date string
    totalAmount: number; // Or string
    paymentType: 'OTA_COLLECT' | 'HOTEL_COLLECT';
    isInvoiced: boolean;
    // Add other relevant fields
}

interface CreateInvoiceDto {
  bookingIds: string[];
  paymentType: 'OTA_COLLECT' | 'HOTEL_COLLECT';
  notes?: string;
}

interface UpdateInvoiceStatusDto {
  status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'CANCELLED';
}

interface GetInvoicesParams {
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'CANCELLED';
  paymentType?: 'OTA_COLLECT' | 'HOTEL_COLLECT';
  // Add other filter params like date ranges if needed
}

interface GetBookingsParams {
    isInvoiced?: boolean;
    paymentType?: 'OTA_COLLECT' | 'HOTEL_COLLECT';
    // Add other filters as needed
}

const API_BASE = '/finance'; // Adjust if your backend route is different
const BOOKING_API_BASE = '/bookings'; // Adjust if your backend route is different

export const financeApi = {
  getInvoices: async (params: GetInvoicesParams = {}): Promise<Invoice[]> => {
    const response = await axios.get<Invoice[]>(`${API_BASE}/invoices`, { params });
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await axios.get<Invoice>(`${API_BASE}/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await axios.post<Invoice>(`${API_BASE}/invoices`, data);
    return response.data;
  },

  updateInvoiceStatus: async (id: string, data: UpdateInvoiceStatusDto): Promise<Invoice> => {
    const response = await axios.patch<Invoice>(`${API_BASE}/invoices/${id}`, data);
    return response.data;
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE}/invoices/${id}`);
  },

  // Assumed endpoint for fetching uninvoiced bookings
  getUninvoicedBookings: async (params: GetBookingsParams): Promise<Booking[]> => {
    const queryParams = { ...params, isInvoiced: false };
    const response = await axios.get<Booking[]>(`${BOOKING_API_BASE}`, { params: queryParams });
    return response.data;
  },
};

