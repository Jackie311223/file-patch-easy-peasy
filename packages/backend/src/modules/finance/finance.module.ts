import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // Corrected path

@Module({
  imports: [PrismaModule], // Import PrismaModule to use PrismaService
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}

