import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { InvoiceStatus, UserRole } from '@prisma/client';
import { GetUser } from '../core/auth/decorators/get-user.decorator';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @GetUser() user: { id: string; tenantId: string; role: UserRole }
  ) {
    return this.invoicesService.create(createInvoiceDto, user);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findAll(
    @GetUser() user: { id: string; tenantId: string; role: UserRole },
    @Query() query: { status?: InvoiceStatus; startDate?: string; endDate?: string }
  ) {
    return this.invoicesService.findAll(user, query);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findOne(
    @Param('id') id: string,
    @GetUser() user: { id: string; tenantId: string; role: UserRole }
  ) {
    return this.invoicesService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  updateStatus(
    @Param('id') id: string, 
    @Body() updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    @GetUser() user: { id: string; tenantId: string; role: UserRole }
  ) {
    return this.invoicesService.updateStatus(id, updateInvoiceStatusDto.status, user);
  }
}
