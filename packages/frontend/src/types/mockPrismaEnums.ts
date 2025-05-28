// src/types/mockPrismaEnums.ts
// These are mock enums to replace direct imports from @prisma/client in frontend tests
// Import and re-export the actual enums from types/booking.ts to ensure type compatibility

import { 
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  Channel,
  DepositMethod,
  DepositStatus
} from './booking';

// Re-export the enums from booking.ts
export {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  Channel,
  DepositMethod,
  DepositStatus
};

// Mock Property and RoomType interfaces (simplified for frontend use)
export interface Property {
  id: string;
  name: string;
  tenantId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  address: string | null;
  location?: string; // Added to match usage in PropertyTable
  description?: string; // Added to match usage in PropertyTable
}

export interface RoomType {
  id: string;
  name: string;
  propertyId: string;
  tenantId: string;
  price: number; // Changed from any to number for better type safety
  occupancy: number;
  maxOccupancy: number;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
}

// Mock Decimal class if needed for tests, or just use strings/numbers
export class Decimal {
  value: number | string;
  constructor(val: number | string) {
    this.value = val;
  }
  toString() {
    return String(this.value);
  }
  // Add other methods if required by tests (e.g., minus, plus)
}
