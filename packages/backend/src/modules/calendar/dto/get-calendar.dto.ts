import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetCalendarDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  propertyId?: string;
}

