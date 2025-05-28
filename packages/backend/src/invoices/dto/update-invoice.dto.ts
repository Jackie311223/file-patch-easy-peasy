import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

// Currently, only updating the status (e.g., to VOID) might be relevant.
// Other fields like totalAmount or linked payments are generally immutable once created.
export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  // Inheriting from CreateInvoiceDto doesn't make sense here as paymentIds shouldn't be updated.
  // We define only the fields that are logically updatable.
}

