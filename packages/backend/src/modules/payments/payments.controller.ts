import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common'; // Added Query
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto'; // Corrected path
import { UpdatePaymentDto } from './dto/update-payment.dto'; // Corrected path
import { Roles } from '../../core/auth/decorators/roles.decorator'; // Corrected path to core
import { UserRole, PaymentType, PaymentMethodV2, PaymentStatusV2 } from '@prisma/client'; // Use UserRole
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard'; // Corrected path to core
import { RolesGuard } from '../../core/auth/guards/roles.guard'; // Corrected path to core
import { GetUser } from '../../core/auth/decorators/get-user.decorator'; // Corrected path to core

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards globally to this controller
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER) // Use UserRole
  create(@Body() createPaymentDto: CreatePaymentDto, @GetUser() user: { id: string; tenantId: string; role: UserRole }) { // Use GetUser and UserRole
    return this.paymentsService.create(createPaymentDto, user);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF) // Use UserRole
  findAll(@GetUser() user: { id: string; tenantId: string; role: UserRole }, @Query() query: any) { // Use GetUser and UserRole, add Query decorator
    // Assuming findAll might need query params later, but for now just user context
    return this.paymentsService.findAll(user, query);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF) // Use UserRole
  findOne(@Param('id') id: string, @GetUser() user: { id: string; tenantId: string; role: UserRole }) { // Use GetUser and UserRole
    return this.paymentsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER) // Use UserRole
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @GetUser() user: { id: string; tenantId: string; role: UserRole }) { // Use GetUser and UserRole
    return this.paymentsService.update(id, updatePaymentDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN) // Use UserRole
  remove(@Param('id') id: string, @GetUser() user: { id: string; tenantId: string; role: UserRole }) { // Use GetUser and UserRole
    return this.paymentsService.remove(id, user);
  }
}

