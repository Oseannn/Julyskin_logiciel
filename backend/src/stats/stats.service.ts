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
    const lines = await this.prisma.invoiceLine.findMany({
      where: {
        invoice: where,
        productId: { not: null },
      },
      include: { product: true },
    });

    const productStats = lines.reduce((acc, line) => {
      const id = line.productId;
      if (id && !acc[id]) {
        acc[id] = {
          id,
          name: line.name,
          quantity: 0,
          revenue: 0,
        };
      }
      if (id) {
        acc[id].quantity += line.quantity || 0;
        acc[id].revenue += Number(line.total);
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private async getTopServices(where: any) {
    const lines = await this.prisma.invoiceLine.findMany({
      where: {
        invoice: where,
        serviceId: { not: null },
      },
      include: { service: true },
    });

    const serviceStats = lines.reduce((acc, line) => {
      const id = line.serviceId;
      if (id && !acc[id]) {
        acc[id] = {
          id,
          name: line.name,
          quantity: 0,
          revenue: 0,
        };
      }
      if (id) {
        acc[id].quantity += 1; // Count number of times service was used
        acc[id].revenue += Number(line.total);
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
