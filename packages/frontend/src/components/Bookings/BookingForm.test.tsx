import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Import the actual schema constant and the type
import BookingForm, { bookingFormSchema, FormSchemaType } from "./BookingForm"; 
// Import enums directly from booking.ts to ensure type compatibility
import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  Channel,
  DepositMethod,
  DepositStatus
} from '../../types/booking';
// Import Property and RoomType interfaces from mockPrismaEnums
import { Property, RoomType } from "../../types/mockPrismaEnums";
import { BrowserRouter } from "react-router-dom"; // Needed if Link is used indirectly
import { FilterProvider } from "../../contexts/FilterContext"; // Import FilterProvider
import { BookingsProvider } from "../../contexts/BookingsContext"; // Import BookingsProvider
// We still need MockAuthProvider if other components rely on it, but we will mock useAuth directly
import { MockAuthProvider } from "../../contexts/MockAuthContext";
import api from "../../api/axios"; // Import the actual api instance

// --- Mock the useAuth hook ---
jest.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "mock-user-id",
      name: "Mock User",
      email: "mock@example.com",
      role: "ADMIN", // Or whatever role is needed for the tests
      tenantId: "t1",
    },
    token: "mock-token", // Provide a mock token
    isAuthenticated: true,
    isLoading: false,
    // Mock other functions if needed by BookingForm
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));
// --- End Mock ---

// --- Mock the api calls ---
jest.mock("../../api/axios");
// --- End Mock ---

// Mock data using mock types
const mockProperties: Property[] = [
  {
    id: "prop1",
    name: "Hotel Sunshine",
    tenantId: "t1",
    userId: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
    address: null,
  },
  {
    id: "prop2",
    name: "Beach Resort",
    tenantId: "t1",
    userId: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
    address: null,
  },
];

// Fix: Use number for price instead of Decimal object
const mockRoomTypesProp1: RoomType[] = [
  {
    id: "rt1",
    name: "Standard Room",
    propertyId: "prop1",
    tenantId: "t1",
    price: 100, // Use number
    occupancy: 2,
    maxOccupancy: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
  },
  {
    id: "rt2",
    name: "Deluxe Suite",
    propertyId: "prop1",
    tenantId: "t1",
    price: 200, // Use number
    occupancy: 2,
    maxOccupancy: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
  },
];

// Fix: Use number for price instead of Decimal object
const mockRoomTypesProp2: RoomType[] = [
  {
    id: "rt3",
    name: "Ocean View Villa",
    propertyId: "prop2",
    tenantId: "t1",
    price: 300, // Use number
    occupancy: 4,
    maxOccupancy: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
  },
];

// Create a complete Booking object for initialData
const mockBookingData = {
  id: "booking-123",
  userId: "mock-user-id",
  propertyId: "prop1",
  roomTypeId: "rt1",
  guestName: "John Doe",
  contactPhone: "1234567890",
  contactEmail: "john.doe@example.com",
  checkIn: "2025-08-15",
  checkOut: "2025-08-18",
  adults: 2,
  children: 1,
  totalAmount: 300,
  amountPaid: 100,
  commission: 30,
  currency: "USD",
  paymentMethod: PaymentMethod.CREDIT_CARD,
  paymentStatus: PaymentStatus.PARTIALLY_PAID,
  bookingStatus: BookingStatus.CONFIRMED,
  channel: Channel.BOOKING_COM,
  reference: "BK123",
  specialRequests: "Need a baby cot",
  internalNotes: "VIP Guest",
  depositAmount: 50,
  depositDate: "2025-08-01",
  depositMethod: DepositMethod.BANK_TRANSFER,
  // Updated to use PAID instead of RECEIVED which doesn't exist in production enum
  depositStatus: DepositStatus.PAID,
  refundedAmount: 0,
  paymentChannel: "Stripe",
  invoiceUrl: "http://invoice.url",
  assignedStaff: "Alice",
  // Add required fields for Booking type
  nights: 3,
  netRevenue: 270,
  outstandingBalance: 200,
  createdAt: "2025-07-15T10:00:00Z",
  updatedAt: "2025-07-15T10:00:00Z",
  tenantId: "t1", // Ensure tenantId is always provided as a string
  // Add property and roomType objects
  property: {
    id: "prop1",
    name: "Hotel Sunshine"
  },
  roomType: {
    id: "rt1",
    name: "Standard Room"
  }
};

// Create a FormSchemaType object for form testing
const mockFormData: FormSchemaType = {
  propertyId: "prop1",
  roomTypeId: "rt1",
  guestName: "John Doe",
  contactPhone: "1234567890",
  contactEmail: "john.doe@example.com",
  checkIn: "2025-08-15",
  checkOut: "2025-08-18",
  adults: 2,
  children: 1,
  totalAmount: 300,
  amountPaid: 100,
  commission: 30,
  currency: "USD",
  paymentMethod: PaymentMethod.CREDIT_CARD,
  paymentStatus: PaymentStatus.PARTIALLY_PAID,
  bookingStatus: BookingStatus.CONFIRMED,
  channel: Channel.BOOKING_COM,
  reference: "BK123",
  specialRequests: "Need a baby cot",
  internalNotes: "VIP Guest",
  depositAmount: 50,
  depositDate: "2025-08-01",
  depositMethod: DepositMethod.BANK_TRANSFER,
  // Updated to use PAID instead of RECEIVED which doesn't exist in production enum
  depositStatus: DepositStatus.PAID,
  refundedAmount: 0,
  paymentChannel: "Stripe",
  invoiceUrl: "http://invoice.url",
  assignedStaff: "Alice"
};

// Wrapper component to provide Form and necessary Contexts
const TestWrapper = ({
  children,
  defaultValues,
}: { children: React.ReactNode; defaultValues?: Partial<FormSchemaType> }) => { // Use Partial for defaultValues
  const methods = useForm<FormSchemaType>({
    // Use the imported schema constant here
    resolver: zodResolver(bookingFormSchema), 
    defaultValues: defaultValues,
  });
  return (
    <BrowserRouter> {/* Add BrowserRouter if needed */}
      <MockAuthProvider> {/* Keep for potential nested dependencies */}
        <FilterProvider>
          <BookingsProvider>
            <FormProvider {...methods}>
              {/* Pass the mock submit handler to the form if needed for debugging */} 
              <form onSubmit={methods.handleSubmit(jest.fn())}>{children}</form>
            </FormProvider>
          </BookingsProvider>
        </FilterProvider>
      </MockAuthProvider>
    </BrowserRouter>
  );
};

describe("BookingForm", () => {
  const mockOnSubmit = jest.fn();
  const mockHandleClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    // Mock the specific API calls used by BookingForm
    (api.get as jest.Mock).mockImplementation(async (url: string) => { // Make mock async
      // Add a small delay to simulate network latency if needed
      // await new Promise(resolve => setTimeout(resolve, 10)); 
      if (url === '/properties') {
        return { data: mockProperties };
      }
      if (url.startsWith('/properties/prop1/room-types')) {
        // Simulate a slight delay for room type fetching
        await new Promise(resolve => setTimeout(resolve, 50)); 
        return { data: mockRoomTypesProp1 };
      }
      if (url.startsWith('/properties/prop2/room-types')) {
        await new Promise(resolve => setTimeout(resolve, 50)); 
        return { data: mockRoomTypesProp2 };
      }
      throw new Error(`Unhandled API call: ${url}`);
    });
  });

  it("renders correctly for creating a new booking", async () => {
    render(
      <TestWrapper>
        <BookingForm
          onSubmit={mockOnSubmit}
          onCancel={mockHandleClose} 
          isLoading={false}
        />
      </TestWrapper>
    );
    // Wait for properties to load
    await screen.findByRole("option", { name: mockProperties[0].name });
    expect(screen.getByLabelText(/Property/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Room Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Guest Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Check-in Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Check-out Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Amount/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Booking/i })
    ).toBeInTheDocument();
  });

  // Refactor test for editing to be more robust with async waits
  it("renders correctly with default values for editing", async () => {
    render(
      <TestWrapper defaultValues={mockFormData}> 
        <BookingForm
          onSubmit={mockOnSubmit}
          onCancel={mockHandleClose} 
          isLoading={false}
          initialData={mockBookingData} // Pass initialData prop to BookingForm
        />
      </TestWrapper>
    );
    
    // 1. Wait for properties select to be populated
    const propertySelect = screen.getByLabelText(/Property/i);
    await screen.findByRole("option", { name: mockProperties[0].name });

    // 2. Use waitFor to check the value of the property select *after* potential async updates
    await waitFor(() => {
      expect(propertySelect).toHaveValue(mockBookingData.propertyId);
    });

    // 3. Wait for the specific room type option to appear within the select
    const roomTypeSelect = screen.getByLabelText(/Room Type/i);
    
    try {
      // Use waitFor with a longer timeout and explicit check for options
      await waitFor(() => {
          // Use within to query within the select element
          const roomTypeOptions = within(roomTypeSelect).getAllByRole("option");
          expect(roomTypeOptions.length).toBeGreaterThan(1); // At least one option plus the default
          
          // Check if the expected option exists
          const option = within(roomTypeSelect).getByText(mockRoomTypesProp1[0].name);
          expect(option).toBeInTheDocument();
        }, 
        { timeout: 3000 } // Increase timeout to 3 seconds
      );
    } catch (error) {
        console.error("Error finding room type option:", error);
        // Log the select's current state again on failure
        console.log("--- Debugging Room Type Select DOM on Failure ---");
        screen.debug(roomTypeSelect);
        console.log("--- End Debugging --- ");
        throw error; // Re-throw the error to fail the test
    }

    // 4. Use waitFor to check the room type select value *after* options load
    await waitFor(() => {
        expect(roomTypeSelect).toHaveValue(mockBookingData.roomTypeId);
    });

    // 5. Check other fields (these are usually synchronous)
    expect(screen.getByLabelText(/Guest Name/i)).toHaveValue(mockBookingData.guestName);
    expect(screen.getByLabelText(/Check-in Date/i)).toHaveValue(mockBookingData.checkIn);
    expect(screen.getByLabelText(/Total Amount/i)).toHaveValue(mockBookingData.totalAmount); 
    expect(
      screen.getByRole("button", { name: /Update Booking/i })
    ).toBeInTheDocument();
  });

  it("filters room types based on selected property", async () => {
    render(
      <TestWrapper>
        <BookingForm
          onSubmit={mockOnSubmit}
          onCancel={mockHandleClose} 
          isLoading={false}
        />
      </TestWrapper>
    );
    const propertySelect = screen.getByLabelText(/Property/i);
    // Wait for initial properties to load
    await screen.findByRole("option", { name: mockProperties[0].name });

    // Select Property 1
    fireEvent.change(propertySelect, { target: { value: "prop1" } });
    // Wait for room types of prop1 to load using findByRole
    expect(await screen.findByRole("option", { name: /Standard Room/i })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: /Deluxe Suite/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Ocean View Villa/i })).not.toBeInTheDocument();

    // Select Property 2
    fireEvent.change(propertySelect, { target: { value: "prop2" } });
    // Wait for room types of prop2 to load using findByRole
    expect(await screen.findByRole("option", { name: /Ocean View Villa/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Standard Room/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Deluxe Suite/i })).not.toBeInTheDocument();
  });

  it("shows validation errors for required fields on submit", async () => {
    render(
      <TestWrapper>
        <BookingForm
          onSubmit={mockOnSubmit}
          onCancel={mockHandleClose} 
          isLoading={false}
        />
      </TestWrapper>
    );
    // Wait for properties to load before submitting
    await screen.findByRole("option", { name: mockProperties[0].name });

    const submitButton = screen.getByRole("button", { name: /Create Booking/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Property selection is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Guest name is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Contact phone is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Channel is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Check-in date is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Check-out date is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Payment method is required./i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with form data when validation passes", async () => {
    render(
      <TestWrapper>
        <BookingForm
          onSubmit={mockOnSubmit}
          onCancel={mockHandleClose} 
          isLoading={false}
        />
      </TestWrapper>
    );

    // Wait for properties to load
    await screen.findByRole("option", { name: mockProperties[0].name });

    // Fill required fields
    const propertySelect = screen.getByLabelText(/Property/i);
    fireEvent.change(propertySelect, { target: { value: "prop1" } });
    // Wait for room types to load after selecting property
    await screen.findByRole("option", { name: /Standard Room/i }); 
    fireEvent.change(screen.getByLabelText(/Room Type/i), { target: { value: "rt1" } });
    fireEvent.change(screen.getByLabelText(/Guest Name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/Contact Phone/i), { target: { value: "0987654321" } });
    fireEvent.change(screen.getByLabelText(/Check-in Date/i), { target: { value: "2025-09-01" } });
    fireEvent.change(screen.getByLabelText(/Check-out Date/i), { target: { value: "2025-09-05" } });
    fireEvent.change(screen.getByLabelText(/Adults/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/Total Amount/i), { target: { value: "400" } });
    fireEvent.change(screen.getByLabelText(/Amount Paid/i), { target: { value: "400" } });
    fireEvent.change(screen.getByLabelText(/Currency/i), { target: { value: "USD" } });
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: PaymentMethod.CASH } });
    fireEvent.change(screen.getByLabelText(/Payment Status/i), { target: { value: PaymentStatus.PAID } });
    fireEvent.change(screen.getByLabelText(/Booking Status/i), { target: { value: BookingStatus.CONFIRMED } });
    fireEvent.change(screen.getByLabelText(/Booking Channel/i), { target: { value: Channel.DIRECT } });

    const submitButton = screen.getByRole("button", { name: /Create Booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: "prop1",
          roomTypeId: "rt1",
          guestName: "Jane Doe",
          checkIn: "2025-09-01",
          checkOut: "2025-09-05",
          totalAmount: 400, 
          paymentMethod: PaymentMethod.CASH,
          channel: Channel.DIRECT,
        }),
        undefined 
      );
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    render(
      <TestWrapper>
        <BookingForm
          onSubmit={mockOnSubmit}
          onCancel={mockHandleClose} 
          isLoading={false}
        />
      </TestWrapper>
    );
    // Wait for properties to load before interacting
    await screen.findByRole("option", { name: mockProperties[0].name });

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(mockHandleClose).toHaveBeenCalledTimes(1); 
  });
});
