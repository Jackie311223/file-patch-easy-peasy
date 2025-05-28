import { IsArray, IsNotEmpty, IsUUID, ArrayMinSize } from 'class-validator';

export class CreateInvoiceDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("all", { each: true })
  @IsNotEmpty({ each: true })
  paymentIds: string[];

  // tenantId will be inferred from user token
  // invoiceNumber and totalAmount will be calculated by the service
  // status will be set by the service
}

