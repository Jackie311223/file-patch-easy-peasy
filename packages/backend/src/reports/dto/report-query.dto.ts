import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';

export enum ReportRange {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom', // Requires startDate and endDate
}

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(ReportRange)
  range?: ReportRange = ReportRange.MONTHLY; // Default range

  @IsOptional()
  @IsString()
  startDate?: string; // Required if range is CUSTOM

  @IsOptional()
  @IsString()
  endDate?: string; // Required if range is CUSTOM

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  // tenantId will be inferred from user token
}

