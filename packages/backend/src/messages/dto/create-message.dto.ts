import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsEnum(['SYSTEM', 'PRIVATE'], { message: 'Type must be either SYSTEM or PRIVATE' })
  messageType: 'SYSTEM' | 'PRIVATE';

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
