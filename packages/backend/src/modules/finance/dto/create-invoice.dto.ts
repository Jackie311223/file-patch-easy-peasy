import { IsArray, IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PaymentType } from '@prisma/client'; // Assuming PaymentType enum exists

export class CreateInvoiceDto {
  @IsArray()
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

