import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { APP_FILTER } from '@nestjs/core'; // Import APP_FILTER
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './core/auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentsModule } from './payments/payments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';
import { CalendarModule } from './calendar/calendar.module';
import { FinanceModule } from './finance/finance.module'; // Added FinanceModule import
import { UsersModule } from './users/users.module'; // Added UsersModule import
import { MessagesModule } from './messages/messages.module'; // Import MessagesModule
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter'; // Import the filter

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Make ConfigModule global
    AuthModule,
    UsersModule, // Added UsersModule
    BookingModule,
    PrismaModule,
    PaymentsModule,
    InvoicesModule,
    FinanceModule, // Added FinanceModule
    ReportsModule,
    CalendarModule,
    MessagesModule, // Add MessagesModule here
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter, // Register the global filter
    },
  ],
})
export class AppModule {}
