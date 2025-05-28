import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from '../invoices/dto/update-invoice-status.dto'; // Corrected path to invoices DTO
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard'; // Corrected path
import { RolesGuard } from '../../core/auth/guards/roles.guard'; // Corrected path
import { Roles } from '../../core/auth/decorators/roles.decorator'; // Corrected path
import { UserRole } from '@prisma/client'; // Assuming UserRole enum exists
import { GetUser } from '../../core/auth/decorators/get-user.decorator'; // Corrected path

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/invoices')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER) // Define roles allowed to create invoices
  create(@Body() createInvoiceDto: CreateInvoiceDto, @GetUser() user: { id: string; tenantId: string }) {
    // TODO: Implement logic in service
    return this.financeService.createInvoice(createInvoiceDto, user);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findAll(
    @GetUser() user: { id: string; tenantId: string },
    @Query('status') status?: string, 
    @Query('paymentType') paymentType?: string, 
    @Query('startDate') startDate?: string, 
    @Query('endDate') endDate?: string
  ) {
    // TODO: Implement filtering logic in service
    return this.financeService.findAllInvoices({ status, paymentType, startDate, endDate }, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findOne(@Param('id') id: string, @GetUser() user: { id: string; tenantId: string }) {
    // TODO: Implement logic in service
    return this.financeService.findOneInvoice(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateStatus(@Param('id') id: string, @Body() updateInvoiceStatusDto: UpdateInvoiceStatusDto, @GetUser() user: { id: string; tenantId: string }) {
    // TODO: Implement logic in service
    return this.financeService.updateInvoiceStatus(id, updateInvoiceStatusDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string, @GetUser() user: { id: string; tenantId: string }) {
    // TODO: Implement logic in service (Consider soft delete or changing status to VOID/CANCELLED)
    return this.financeService.removeInvoice(id, user);
  }
}

