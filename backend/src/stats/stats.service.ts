import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(period: 'day' | 'week' | 'month' | 'year' = 'day') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Nombre de produits vendus
    const productsSold = await this.prisma.invoiceLine.aggregate({
      where: {
        type: 'PRODUCT',
        invoice: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Chiffre d'affaires
    const revenue = await this.prisma.invoice.aggregate({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Nombre de clients uniques ayant acheté
    const clientsWithPurchases = await this.prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        clientId: true,
      },
      distinct: ['clientId'],
    });

    // Meilleurs clients (top 5)
    const topClients = await this.prisma.invoice.groupBy({
      by: ['clientId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 5,
    });

    const topClientsWithDetails = await Promise.all(
      topClients.map(async (tc) => {
        const client = await this.prisma.client.findUnique({
          where: { id: tc.clientId },
        });
        return {
          client,
          totalSpent: tc._sum.total,
          invoiceCount: tc._count,
        };
      }),
    );

    // Top 3 produits les plus vendus
    const topProducts = await this.prisma.invoiceLine.groupBy({
      by: ['productId'],
      where: {
        type: 'PRODUCT',
        productId: { not: null },
        invoice: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 3,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await this.prisma.product.findUnique({
          where: { id: tp.productId },
        });
        return {
          product,
          quantitySold: tp._sum.quantity,
          revenue: tp._sum.total,
        };
      }),
    );

    // Nombre total de clients
    const totalClients = await this.prisma.client.count();

    // Produits en rupture de stock
    const lowStockProducts = await this.prisma.product.count({
      where: {
        stock: {
          lt: 10,
        },
        isActive: true,
      },
    });

    return {
      period,
      productsSold: productsSold._sum.quantity || 0,
      revenue: revenue._sum.total || 0,
      invoiceCount: revenue._count,
      clientsWithPurchases: clientsWithPurchases.length,
      totalClients,
      lowStockProducts,
      topClients: topClientsWithDetails,
      topProducts: topProductsWithDetails,
    };
  }
}
