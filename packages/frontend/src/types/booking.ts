// Use regular enums to allow runtime iteration for forms
export enum Channel {
  AIRBNB = "AIRBNB",
  AGODA = "AGODA",
  BOOKING_COM = "BOOKING_COM",
  CTRIP = "CTRIP",
  EXPEDIA = "EXPEDIA",
  TRAVELOKA = "TRAVELOKA",
  KLOOK = "KLOOK",
  DIRECT = "DIRECT",
  OTHER = "OTHER",
}

export enum PaymentMethod {
  OTA_COLLECT = "OTA_COLLECT",
  HOTEL_COLLECT = "HOTEL_COLLECT",
  UPC = "UPC",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  MOMO = "MOMO",
}

export enum PaymentStatus {
  PAID = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  UNPAID = "UNPAID",
  REFUNDED = "REFUNDED",
}

export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export enum DepositMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  MOMO = "MOMO",
  UPC = "UPC",
  CREDIT_CARD = "CREDIT_CARD",
}

export enum DepositStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  FORFEITED = "FORFEITED",
}

// Main Booking interface matching backend response (including nested property)
// Use number for amounts, handle nulls
export interface Booking {
  id: string;
  guestName: string;
  contactEmail?: string | null;
  contactPhone: string;
  channel: Channel;
  reference?: string | null;
  checkIn: string; // ISO Date string YYYY-MM-DD
  checkOut: string; // ISO Date string YYYY-MM-DD
  nights: number;
  adults: number;
  children: number;
  totalAmount: number;
  commission?: number | null;
  netRevenue: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentChannel?: string | null;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  outstandingBalance: number;
  refundedAmount?: number | null;
  invoiceUrl?: string | null;
  assignedStaff?: string | null;
  specialRequests?: string | null;
  internalNotes?: string | null;
  bookingStatus: BookingStatus;
  
  // Deposit Fields
  depositAmount?: number | null;
  depositDate?: string | null; // ISO Date string YYYY-MM-DD
  depositMethod?: DepositMethod | null;
  depositStatus?: DepositStatus | null;

  // Timestamps
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string

  // Relations
  propertyId: string;
  property: {
    id: string;
    name: string;
  };
  roomTypeId?: string | null;
  roomType?: {
    id: string;
    name: string;
  };
  userId: string;
  tenantId: string; // Added for multi-tenant support
}

// Interface for form data - should match the inferred type from Zod schema (FormSchemaType)
export interface BookingFormData {
  propertyId: string; // Required
  roomTypeId?: string | undefined; // Optional, use undefined
  guestName: string; // Required
  contactEmail?: string | undefined; // Optional, use undefined
  contactPhone: string; // Required
  channel: Channel; // Required
  reference?: string | undefined; // Optional
  checkIn: string; // Required, YYYY-MM-DD
  checkOut: string; // Required, YYYY-MM-DD
  adults: number; // Required, number
  children?: number | undefined; // Optional, number
  totalAmount: number; // Required, number
  commission?: number | undefined; // Optional, number
  currency?: string | undefined; // Optional
  paymentMethod: PaymentMethod; // Required
  paymentChannel?: string | undefined; // Optional
  paymentStatus?: PaymentStatus | undefined; // Optional
  amountPaid?: number | undefined; // Optional, number
  refundedAmount?: number | undefined; // Optional, number
  invoiceUrl?: string | undefined; // Optional
  assignedStaff?: string | undefined; // Optional
  specialRequests?: string | undefined; // Optional
  internalNotes?: string | undefined; // Optional
  bookingStatus?: BookingStatus | undefined; // Optional
  depositAmount?: number | undefined; // Optional, number
  depositDate?: string | undefined; // Optional, YYYY-MM-DD
  depositMethod?: DepositMethod | undefined; // Optional
  depositStatus?: DepositStatus | undefined; // Optional
}
