import { IsOptional, IsString, IsDateString, IsNumber, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { BookingStatus, PaymentStatusV2, PaymentMethodV2, PaymentType } from '@prisma/client';

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsNumber()
  adults?: number;

  @IsOptional()
  @IsNumber()
  children?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  // Fields related to payment might also be updatable, adding common ones
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsEnum(PaymentStatusV2)
  paymentStatus?: PaymentStatusV2;

  @IsOptional()
  @IsEnum(PaymentMethodV2)
  paymentMethod?: PaymentMethodV2;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsUUID()
  propertyId?: string; // Allow updating property assignment

  @IsOptional()
  @IsUUID()
  roomTypeId?: string; // Allow updating room type assignment
}

