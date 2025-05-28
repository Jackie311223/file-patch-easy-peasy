import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { UserRole } from '@prisma/client';
// Assume AuthGuard and RolesGuard are set up
// import { AuthGuard } from '../auth/auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@Controller('reports')
// @UseGuards(AuthGuard, RolesGuard) // Apply guards globally or per controller
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER) // Define who can access revenue reports
  getRevenueReport(@Req() req, @Query() query: ReportQueryDto) {
    const user = req.user; // Assuming user info is attached by AuthGuard
    return this.reportsService.getRevenueReport(user, query);
  }

  @Get('occupancy')
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER)
  getOccupancyReport(@Req() req, @Query() query: ReportQueryDto) {
    const user = req.user;
    return this.reportsService.getOccupancyReport(user, query);
  }

  @Get('source')
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER)
  getSourceReport(@Req() req, @Query() query: ReportQueryDto) {
    const user = req.user;
    return this.reportsService.getSourceReport(user, query);
  }
}

