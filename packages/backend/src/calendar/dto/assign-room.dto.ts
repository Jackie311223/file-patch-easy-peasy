import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRoomDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @IsNotEmpty()
  @IsUUID()
  roomId: string;
}
