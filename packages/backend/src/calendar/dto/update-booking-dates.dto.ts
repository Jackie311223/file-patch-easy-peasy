import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateBookingDatesDto {
  @IsNotEmpty()
  @IsDateString()
  checkIn: string;

  @IsNotEmpty()
  @IsDateString()
  checkOut: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  nights?: number; // Optional, can be calculated from checkIn and checkOut
}
