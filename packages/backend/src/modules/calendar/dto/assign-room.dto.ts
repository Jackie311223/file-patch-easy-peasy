import { IsNotEmpty, IsString } from 'class-validator';

export class AssignRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

