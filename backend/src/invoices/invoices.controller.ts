import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create(createInvoiceDto, req.user.id);
  }

  @Post(':id/validate')
  validate(@Param('id') id: string, @Request() req) {
    return this.invoicesService.validate(id, req.user.id, req.user.role);
  }

  @Get()
  findAll(@Request() req, @Query() filters: any) {
    return this.invoicesService.findAll(req.user.id, req.user.role, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.invoicesService.findOne(id, req.user.id, req.user.role);
  }
}
