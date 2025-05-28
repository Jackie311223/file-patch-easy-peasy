import { 
  IsString, 
  IsEmail, 
  IsPhoneNumber, 
  IsEnum, 
  IsDateString, 
  IsInt, 
  IsDecimal, 
  IsOptional, 
  IsUUID, 
  Min, 
  IsUrl, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { 
  Channel, 
  PaymentMethod, 
  PaymentStatus, 
  BookingStatus, 
  DepositMethod, 
  DepositStatus, 
  PaymentType // Added PaymentType enum
} from '@prisma/client'; // Assuming Prisma generates these enums

export class CreateBookingDto {
  @IsUUID()
  propertyId: string;

  @IsUUID()
  roomTypeId: string; // Required: Link directly to room type

  @IsString()
  guestName: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsString() // Consider more specific phone validation if needed
  // @IsPhoneNumber(null) // Example: Specify region or leave null for general
  contactPhone: string;

  @IsEnum(Channel)
  channel: Channel;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsDateString()
  checkIn: string; // ISO 8601 format string

  @IsDateString()
  checkOut: string; // ISO 8601 format string

  // nights will be calculated in the service

  @IsInt()
  @Min(1)
  adults: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number = 0;

  @IsDecimal({ decimal_digits: '2' })
  totalAmount: string; // Use string for decimal to avoid precision issues

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  commission?: string;

  // netRevenue will be calculated in the service

  @IsOptional()
  @IsString()
  currency?: string = 'VND';

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentType) // Added paymentType field
  paymentType: PaymentType;

  @IsOptional()
  @IsString()
  paymentChannel?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus = PaymentStatus.UNPAID;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  amountPaid?: string = '0.00';

  // outstandingBalance will be calculated in the service

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  refundedAmount?: string;

  @IsOptional()
  @IsUrl()
  invoiceUrl?: string;

  @IsOptional()
  @IsString()
  assignedStaff?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus = BookingStatus.PENDING;

  // Deposit Fields
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  depositAmount?: string;

  @IsOptional()
  @IsDateString()
  depositDate?: string;

  @IsOptional()
  @IsEnum(DepositMethod)
  depositMethod?: DepositMethod;

  @IsOptional()
  @IsEnum(DepositStatus)
  depositStatus?: DepositStatus = DepositStatus.PENDING;
  
  // tenantId will be added in the service based on the authenticated user's tenant
  // userId will be added in the service based on the authenticated user
}
