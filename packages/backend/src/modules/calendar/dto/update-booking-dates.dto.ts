import { IsDateString, IsNotEmpty } from 'class-validator';

export class UpdateBookingDatesDto {
  @IsDateString()
  @IsNotEmpty()
  checkIn: string;

  @IsDateString()
  @IsNotEmpty()
  checkOut: string;
}

