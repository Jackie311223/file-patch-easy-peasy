import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsOptional, IsEnum, IsNumber, IsDateString, IsString } from 'class-validator';
import { PaymentStatusV2, PaymentMethodV2 } from '@prisma/client';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  // Allow updating specific fields, overriding optionality from CreatePaymentDto if needed

  @IsOptional()
  @IsEnum(PaymentStatusV2)
  status?: PaymentStatusV2;

  @IsOptional()
  @IsEnum(PaymentMethodV2)
  method?: PaymentMethodV2;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  note?: string;

  // bookingId, paymentType, collectedById, receivedFrom are generally not updatable after creation
  // Remove them explicitly if they are inherited as optional from PartialType
  bookingId?: never;
  paymentType?: never;
  collectedById?: never;
  receivedFrom?: never;
}

