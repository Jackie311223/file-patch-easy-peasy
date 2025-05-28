import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BookingsController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookingsController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
