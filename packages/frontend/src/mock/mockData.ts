import { Property } from '../types/property';
import { RoomType } from '../types/roomType';
// Import const enums and types
import { Booking, BookingStatus, Channel, PaymentMethod, PaymentStatus, DepositMethod, DepositStatus } from '../types/booking'; 
// Removed date-fns import for now, will add if needed after fixing core type issues

// Mock data for Properties - Corrected based on Property type
export const mockProperties: Property[] = [
  {
    id: "prop-001",
    name: "Beach Resort & Spa",
    location: "Nha Trang, Vietnam", // Use location
    description: "A luxurious beachfront resort with stunning ocean views and world-class amenities.",
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd',
      'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf'
    ],
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prop-002",
    name: "Mountain View Lodge",
    location: "Da Lat, Vietnam", // Use location
    description: "A cozy mountain retreat surrounded by pine forests and cool climate all year round.",
    images: [
      'https://images.unsplash.com/photo-1518602164578-cd0074062767',
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c',
      'https://images.unsplash.com/photo-1469796466635-455ede028aca'
    ],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prop-003",
    name: "City Center Hotel",
    location: "Ho Chi Minh City, Vietnam", // Use location
    description: "A modern hotel located in the heart of the bustling city, perfect for business travelers.",
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791'
    ],
    createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Mock data for RoomTypes - Corrected based on RoomType type
export const mockRoomTypes: RoomType[] = [
  {
    id: "room-001",
    propertyId: "prop-001",
    name: "Deluxe Ocean View",
    description: "Spacious room with private balcony and panoramic ocean views.",
    occupancy: 2, // Use occupancy
    price: 2500000, // Use price
    quantity: 15, // Use quantity
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "room-002",
    propertyId: "prop-001",
    name: "Family Suite",
    description: "Large suite with separate living area and two bedrooms, perfect for families.",
    occupancy: 4, // Use occupancy
    price: 4500000, // Use price
    quantity: 8, // Use quantity
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "room-003",
    propertyId: "prop-002",
    name: "Cozy Cabin",
    description: "Rustic wooden cabin with fireplace and mountain views.",
    occupancy: 2, // Use occupancy
    price: 1800000, // Use price
    quantity: 12, // Use quantity
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "room-005", // Assuming room-004 was skipped or removed
    propertyId: "prop-003",
    name: "Business Room",
    description: "Modern room with work desk and high-speed internet, ideal for business travelers.",
    occupancy: 1, // Use occupancy
    price: 1200000, // Use price
    quantity: 25, // Use quantity
    createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Function to get room types by property ID
export const getRoomTypesByPropertyId = (propertyId: string): RoomType[] => {
  return mockRoomTypes.filter(roomType => roomType.propertyId === propertyId);
};

// Mock data for Bookings - Refactored to match new Booking type
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-001',
    propertyId: 'prop-001',
    roomTypeId: 'room-001',
    userId: 'user1',
    tenantId: 'tenant-a-uuid', // Added tenantId
    guestName: 'Alice Wonderland',
    contactEmail: 'alice.w@example.com',
    contactPhone: '+1-555-1234',
    channel: Channel.DIRECT,
    reference: 'DIRECT123',
    checkIn: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    nights: 5,
    adults: 2,
    children: 0,
    totalAmount: 12500000,
    commission: 0,
    netRevenue: 12500000,
    currency: 'VND',
    paymentMethod: PaymentMethod.CASH,
    paymentStatus: PaymentStatus.UNPAID,
    amountPaid: 0,
    outstandingBalance: 12500000,
    bookingStatus: BookingStatus.CONFIRMED,
    internalNotes: 'Needs an extra pillow.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    property: { id: 'prop-001', name: 'Beach Resort & Spa' },
    roomType: { id: 'room-001', name: 'Deluxe Ocean View' }, // Added roomType
  },
  {
    id: 'booking-002',
    propertyId: 'prop-002',
    roomTypeId: 'room-003',
    userId: 'user1',
    tenantId: 'tenant-a-uuid', // Added tenantId
    guestName: 'Bob The Builder',
    contactEmail: 'bob.b@example.com',
    contactPhone: '+44-20-7946-0958',
    channel: Channel.BOOKING_COM,
    reference: 'BKCOM456',
    checkIn: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    checkOut: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    nights: 7,
    adults: 1,
    children: 0,
    totalAmount: 12600000,
    commission: 1890000,
    netRevenue: 10710000,
    currency: 'VND',
    paymentMethod: PaymentMethod.OTA_COLLECT,
    paymentStatus: PaymentStatus.PAID,
    amountPaid: 12600000,
    outstandingBalance: 0,
    bookingStatus: BookingStatus.CONFIRMED,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    property: { id: 'prop-002', name: 'Mountain View Lodge' },
    roomType: { id: 'room-003', name: 'Cozy Cabin' }, // Added roomType
  },
  {
    id: 'booking-003',
    propertyId: 'prop-001',
    roomTypeId: 'room-002',
    userId: 'user1',
    tenantId: 'tenant-a-uuid', // Added tenantId
    guestName: 'Charlie Chaplin',
    contactEmail: 'charlie.c@example.com',
    contactPhone: '+33-1-40-09-88-77',
    channel: Channel.EXPEDIA,
    reference: 'EXP789',
    checkIn: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    checkOut: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nights: 5,
    adults: 2,
    children: 2,
    totalAmount: 25000000,
    commission: 3750000,
    netRevenue: 21250000,
    currency: 'VND',
    paymentMethod: PaymentMethod.OTA_COLLECT,
    paymentStatus: PaymentStatus.PAID,
    amountPaid: 25000000,
    outstandingBalance: 0,
    bookingStatus: BookingStatus.CONFIRMED,
    internalNotes: 'Late check-in requested.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    property: { id: 'prop-001', name: 'Beach Resort & Spa' },
    roomType: { id: 'room-002', name: 'Family Suite' }, // Added roomType
  },
  {
    id: 'booking-004',
    propertyId: 'prop-003',
    roomTypeId: 'room-005',
    userId: 'user1',
    tenantId: 'tenant-b-uuid', // Added tenantId
    guestName: 'Diana Prince',
    contactEmail: 'diana.p@example.com',
    contactPhone: '+1-202-555-0175',
    channel: Channel.AIRBNB,
    reference: 'AIR101',
    checkIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    checkOut: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
    nights: 2,
    adults: 1,
    children: 0,
    totalAmount: 2400000,
    commission: 360000,
    netRevenue: 2040000,
    currency: 'VND',
    paymentMethod: PaymentMethod.OTA_COLLECT,
    paymentStatus: PaymentStatus.PAID,
    amountPaid: 2400000,
    outstandingBalance: 0,
    bookingStatus: BookingStatus.CONFIRMED,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
    property: { id: 'prop-003', name: 'City Center Hotel' },
    roomType: { id: 'room-005', name: 'Business Room' }, // Added roomType
  },
   {
    id: 'booking-005',
    propertyId: 'prop-002',
    roomTypeId: 'room-003',
    userId: 'user1',
    tenantId: 'tenant-b-uuid', // Added tenantId
    guestName: 'Ethan Hunt',
    contactEmail: 'ethan.h@example.com',
    contactPhone: '+1-703-555-0123',
    channel: Channel.OTHER,
    reference: 'WalkIn001',
    checkIn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    checkOut: new Date(Date.now() + 34 * 24 * 60 * 60 * 1000).toISOString(),
    nights: 4,
    adults: 2,
    children: 0,
    totalAmount: 7200000,
    commission: 0,
    netRevenue: 7200000,
    currency: 'VND',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    paymentStatus: PaymentStatus.PARTIALLY_PAID,
    amountPaid: 2000000,
    outstandingBalance: 5200000,
    bookingStatus: BookingStatus.CANCELLED,
    internalNotes: 'Cancelled due to change of plans.',
    depositAmount: 1000000,
    depositStatus: DepositStatus.REFUNDED,
    depositMethod: DepositMethod.BANK_TRANSFER,
    depositDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    property: { id: 'prop-002', name: 'Mountain View Lodge' },
    roomType: { id: 'room-003', name: 'Cozy Cabin' }, // Added roomType
  }
];
