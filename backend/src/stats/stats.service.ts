import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(startDate?: Date, endDate?: Date) {
    const where: any = { status: InvoiceStatus.VALIDATED };
    
    if (startDate || endDate) {
      where.validatedAt = {};
      if (startDate) where.validatedAt.gte = startDate;
      if (endDate) where.validatedAt.lte = endDate;
    }

    const [totalRevenue, invoiceCount, topProducts, topServices, salesByUser] = await Promise.all([
      this.prisma.invoice.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.invoice.count({ where }),
      this.getTopProducts(where),
      this.getTopServices(where),
      this.getSalesByUser(where),
    ]);

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      invoiceCount,
      topProducts,
      topServices,
      salesByUser,
    };
  }

  private async getTopProducts(where: any) {
    const items = await this.prisma.invoiceItem.findMany({
      where: {
        invoice: where,
        productId: { not: null },
      },
      include: { product: true },
    });

    const productStats = items.reduce((acc, item) => {
      const id = item.productId;
      if (id && !acc[id]) {
        acc[id] = {
          id,
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }
      if (id) {
        acc[id].quantity += item.quantity;
        acc[id].revenue += Number(item.total);
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private async getTopServices(where: any) {
    const items = await this.prisma.invoiceItem.findMany({
      where: {
        invoice: where,
        serviceId: { not: null },
      },
      include: { service: true },
    });

    const serviceStats = items.reduce((acc, item) => {
      const id = item.serviceId;
      if (id && !acc[id]) {
        acc[id] = {
          id,
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }
      if (id) {
        acc[id].quantity += item.quantity;
        acc[id].revenue += Number(item.total);
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(serviceStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private async getSalesByUser(where: any) {
    const invoices = await this.prisma.invoice.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    const userStats = invoices.reduce((acc, invoice) => {
      const userId = invoice.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: `${invoice.user.firstName} ${invoice.user.lastName}`,
          invoiceCount: 0,
          revenue: 0,
        };
      }
      acc[userId].invoiceCount += 1;
      acc[userId].revenue += Number(invoice.total);
      return acc;
    }, {});

    return Object.values(userStats).sort((a: any, b: any) => b.revenue - a.revenue);
  }
}
