import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PaymentType } from '@prisma/client';

export class CreateInvoiceDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  bookingIds: string[];

  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType: PaymentType;

  @IsOptional()
  @IsString()
  notes?: string;
}

