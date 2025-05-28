import { IsNotEmpty, IsString, IsUUID, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class GetCalendarDto {
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(BookingStatus, { each: true })
  bookingStatus?: BookingStatus[];

  @IsOptional()
  @IsUUID()
  roomTypeId?: string;
}
