import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { ProductsModule } from '../products/products.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [ProductsModule, ServicesModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
