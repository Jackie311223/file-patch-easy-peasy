import { PartialType } from '@nestjs/mapped-types'; // Or '@nestjs/swagger' if using Swagger
import { CreateBookingDto } from './create-booking.dto';
import { IsOptional, IsUUID, IsString, IsEnum, IsDateString, IsInt, IsNumber, Min, IsEmail, IsBoolean } from 'class-validator';
import { BookingStatus, Channel, PaymentMethod, PaymentStatus, DepositMethod, DepositStatus } from '@prisma/client';

// Using PartialType makes all fields optional. We might need to explicitly define fields 
// if we want different validation rules for update vs create.
export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  // Explicitly add fields that might be missing or need specific validation for update
  // PartialType should handle making them optional, but let's be explicit for clarity
  // and to ensure they exist for type checking in tests.

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  roomTypeId?: string;

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsEnum(Channel)
  channel?: Channel;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  adults?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @IsOptional()
  @IsString() // Keep as string for input, convert in service
  totalAmount?: string;

  @IsOptional()
  @IsString()
  commission?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentChannel?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  amountPaid?: string;

  @IsOptional()
  @IsString()
  refundedAmount?: string;

  @IsOptional()
  @IsString()
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
  bookingStatus?: BookingStatus;

  @IsOptional()
  @IsString()
  depositAmount?: string;

  @IsOptional()
  @IsDateString()
  depositDate?: string;

  @IsOptional()
  @IsEnum(DepositMethod)
  depositMethod?: DepositMethod;

  @IsOptional()
  @IsEnum(DepositStatus)
  depositStatus?: DepositStatus;
}

