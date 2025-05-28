import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class UpdateInvoiceStatusDto {
  @IsNotEmpty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
