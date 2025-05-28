import { IsString, IsNotEmpty, IsUUID, IsEnum, IsNumber, IsDateString, IsOptional, ValidateIf } from 'class-validator';
import { PaymentType, PaymentMethodV2, PaymentStatusV2 } from '@prisma/client';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsNotEmpty()
  @IsEnum(PaymentMethodV2)
  method: PaymentMethodV2;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  paymentDate: string; // Use string for ISO 8601 date format

  @IsOptional()
  @IsEnum(PaymentStatusV2)
  status?: PaymentStatusV2 = PaymentStatusV2.PAID; // Default to PAID on creation?

  @ValidateIf(o => o.paymentType === PaymentType.HOTEL_COLLECT)
  @IsNotEmpty({ message: 'collectedBy is required for HOTEL_COLLECT payments' })
  @IsUUID()
  collectedById?: string;

  @ValidateIf(o => o.paymentType === PaymentType.OTA_COLLECT)
  @IsNotEmpty({ message: 'receivedFrom is required for OTA_COLLECT payments' })
  @IsString()
  receivedFrom?: string;

  @IsOptional()
  @IsString()
  note?: string;

  // tenantId will be inferred from the user token, not passed in DTO
}

