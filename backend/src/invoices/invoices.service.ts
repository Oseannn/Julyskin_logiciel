import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        client: true,
        user: true,
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        user: true,
        lines: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });
  }

  async create(data: any, userId: string) {
    const settings = await this.prisma.settings.findFirst();
    const invoiceNumber = `${settings.invoicePrefix}${String(settings.nextInvoiceNumber).padStart(5, '0')}`;

    let subtotal = new Decimal(0);
    const lines = [];

    for (const item of data.items) {
      if (item.type === 'PRODUCT') {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new BadRequestException('Product not found');

        const lineTotal = new Decimal(product.sellingPrice).mul(item.quantity);
        subtotal = subtotal.add(lineTotal);

        lines.push({
          type: 'PRODUCT',
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
          total: lineTotal,
        });
      } else if (item.type === 'SERVICE') {
        const service = await this.prisma.service.findUnique({
          where: { id: item.serviceId },
        });
        if (!service) throw new BadRequestException('Service not found');

        let lineTotal: Decimal;
        let duration = item.duration;

        if (service.billingType === 'PAR_MINUTE') {
          if (!duration) throw new BadRequestException('Duration required for PAR_MINUTE');
          lineTotal = new Decimal(service.unitPrice).mul(duration);
        } else if (service.billingType === 'PAR_HEURE') {
          if (!duration) throw new BadRequestException('Duration required for PAR_HEURE');
          lineTotal = new Decimal(service.unitPrice).mul(duration).div(60);
        } else {
          lineTotal = new Decimal(service.unitPrice);
          duration = null;
        }

        subtotal = subtotal.add(lineTotal);

        lines.push({
          type: 'SERVICE',
          serviceId: service.id,
          name: service.name,
          duration,
          unitPrice: service.unitPrice,
          total: lineTotal,
        });
      }
    }

    const taxRate = data.taxRate || settings.defaultTaxRate;
    const taxAmount = subtotal.mul(taxRate).div(100);
    const total = subtotal.add(taxAmount);

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: data.clientId,
        userId,
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes: data.notes,
        lines: {
          create: lines,
        },
      },
      include: {
        client: true,
        user: true,
        lines: true,
      },
    });

    await this.prisma.settings.update({
      where: { id: settings.id },
      data: { nextInvoiceNumber: settings.nextInvoiceNumber + 1 },
    });

    return invoice;
  }

  async remove(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }
}
