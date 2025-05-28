import { IsEnum, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryMessagesDto {
  @IsOptional()
  @IsEnum(['SYSTEM', 'PRIVATE'], { message: 'Type must be either SYSTEM or PRIVATE' })
  type?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isRead?: boolean;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  offset?: number = 0;
}
