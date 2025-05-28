import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from '../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../core/auth/guards/roles.guard';
import { GetUser } from '../core/auth/decorators/get-user.decorator'; // Import GetUser
import { User } from '../types/user.interface'; // Import User interface

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at controller level
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN) // Only SUPER_ADMIN can access (or adjust as needed)
  findAll(@GetUser() user: User) {
    // Pass tenantId and potentially role for filtering in service
    return this.paymentsService.findAll(user.tenantId, user.role);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN) // Only SUPER_ADMIN can access (or adjust as needed)
  findOne(@Param('id') id: string, @GetUser() user: User) {
    // Pass tenantId and potentially role for filtering in service
    return this.paymentsService.findOne(id, user.tenantId, user.role);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN) // Only SUPER_ADMIN can access (or adjust as needed)
  create(@Body() createPaymentDto: any, @GetUser() user: User) {
    // Pass tenantId for association in service
    return this.paymentsService.create(createPaymentDto, user.tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN) // Only SUPER_ADMIN can access (or adjust as needed)
  update(@Param('id') id: string, @Body() updatePaymentDto: any, @GetUser() user: User) {
    // Pass tenantId and potentially role for filtering in service
    return this.paymentsService.update(id, updatePaymentDto, user.tenantId, user.role);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN) // Only SUPER_ADMIN can access (or adjust as needed)
  remove(@Param('id') id: string, @GetUser() user: User) {
    // Pass tenantId and potentially role for filtering in service
    return this.paymentsService.remove(id, user.tenantId, user.role);
  }
}
