import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './src/app.controller';
import { AppService } from './src/app.service';
import { AuthModule } from './src/auth/auth.module'; // Sửa lại đường dẫn cho đúng với AuthModule
import { UsersModule } from './src/users/users.module';
import { PrismaModule } from './src/prisma/prisma.module';
import { AllExceptionsFilter } from './src/core/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    PrismaModule,
    // Các module khác sẽ thêm lại sau khi Phase 1 ổn định
    // BookingModule,
    // PaymentsModule,
    // InvoicesModule,
    // FinanceModule,
    // ReportsModule,
    // CalendarModule,
    // MessagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // PrismaService, // Chỉ cần nếu PrismaModule không export PrismaService
  ],
})
export class AppModule {}