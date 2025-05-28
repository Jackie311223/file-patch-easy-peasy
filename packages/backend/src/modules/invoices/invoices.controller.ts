import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'; // Removed Req
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from '../finance/dto/create-invoice.dto'; // Assuming this path is correct
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto'; // Corrected import path
import { Roles } from '../../core/auth/decorators/roles.decorator'; // Corrected path to core
import { UserRole, InvoiceStatus, PaymentType } from '@prisma/client'; // Use UserRole
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard'; // Corrected path to core
import { RolesGuard } from '../../core/auth/guards/roles.guard'; // Corrected path to core
import { GetUser } from '../../core/auth/decorators/get-user.decorator'; // Corrected path to core
// import { Request } from 'express'; // Removed unused import

@Controller('invoices') // Corrected controller path
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards globally
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER) // Use UserRole
  create(@Body() createInvoiceDto: CreateInvoiceDto, @GetUser() user: { id: string; tenantId: string; role: UserRole }) {
    return this.invoicesService.createInvoice(createInvoiceDto, user);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF) // Use UserRole
  findAll(@GetUser() user: { id: string; tenantId: string; role: UserRole }, @Query() query: { status?: InvoiceStatus; paymentType?: PaymentType; startDate?: string; endDate?: string }) {
    return this.invoicesService.findAllInvoices(user, query || {});
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF) // Use UserRole
  findOne(@Param('id') id: string, @GetUser() user: { id: string; tenantId: string; role: UserRole }) {
    return this.invoicesService.findOneInvoice(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER) // Use UserRole
  updateStatus(@Param('id') id: string, @Body() updateInvoiceStatusDto: UpdateInvoiceStatusDto, @GetUser() user: { id: string; tenantId: string; role: UserRole }) {
    return this.invoicesService.updateInvoiceStatus(id, updateInvoiceStatusDto, user);
  }

  @Delete(':id') // Removed duplicate decorator
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER) // Use UserRole
  remove(@Param('id') id: string, @GetUser() user: { id: string; tenantId: string; role: UserRole }) {
    return this.invoicesService.removeInvoice(id, user);
  }
}
