import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Stub implementation for TypeScript compilation
  @Get()
  findAll() {
    return this.financeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financeService.findOne(id);
  }

  @Post()
  create(@Body() createFinanceDto: any) {
    return this.financeService.create(createFinanceDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFinanceDto: any) {
    return this.financeService.update(id, updateFinanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financeService.remove(id);
  }
}
