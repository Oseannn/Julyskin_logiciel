import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role, StockMovementType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });
  }

  async findAll(userRole: Role) {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    if (userRole === Role.VENDEUSE) {
      return products.map(({ purchasePrice, ...product }) => product);
    }

    return products;
  }

  async findOne(id: string, userRole: Role) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
        category: true,
        stockMovements: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (userRole === Role.VENDEUSE) {
      const { purchasePrice, ...result } = product;
      return result;
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });
  }

  async adjustStock(id: string, quantity: number, userId: string, reason?: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new ForbiddenException('Stock insuffisant');
    }

    await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id },
        data: { stock: newStock },
      }),
      this.prisma.stockMovement.create({
        data: {
          productId: id,
          type: quantity > 0 ? StockMovementType.IN : StockMovementType.OUT,
          quantity: Math.abs(quantity),
          reason,
          userId,
        },
      }),
    ]);

    return this.findOne(id, Role.ADMIN);
  }

  async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: {
        stock: { lte: this.prisma.product.fields.alertThreshold },
        isActive: true,
      },
      include: { category: true },
      orderBy: { stock: 'asc' },
    });
  }
}
