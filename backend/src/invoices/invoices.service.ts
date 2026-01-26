import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Role, InvoiceStatus, StockMovementType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string) {
    const settings = await this.prisma.settings.findFirst();
    const taxRate = createInvoiceDto.taxRate || settings?.defaultTaxRate || new Decimal(20);

    let subtotal = new Decimal(0);
    const itemsData = [];

    for (const item of createInvoiceDto.items) {
      let name: string;
      let unitPrice: Decimal;

      if (item.productId) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Produit ${item.productId} non trouvé`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuffisant pour ${product.name}`);
        }
        name = product.name;
        unitPrice = product.sellingPrice;
      } else if (item.serviceId) {
        const service = await this.prisma.service.findUnique({ where: { id: item.serviceId } });
        if (!service) throw new NotFoundException(`Service ${item.serviceId} non trouvé`);
        name = service.name;
        unitPrice = service.price;
      } else {
        throw new BadRequestException('Chaque item doit avoir un productId ou serviceId');
      }

      const total = new Decimal(unitPrice).mul(item.quantity);
      subtotal = subtotal.add(total);

      itemsData.push({
        productId: item.productId,
        serviceId: item.serviceId,
        name,
        quantity: item.quantity,
        unitPrice,
        total,
      });
    }

    const taxAmount = subtotal.mul(taxRate).div(100);
    const total = subtotal.add(taxAmount);

    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = await this.prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          clientId: createInvoiceDto.clientId,
          userId,
          subtotal,
          taxRate,
          taxAmount,
          total,
          status: InvoiceStatus.DRAFT,
          notes: createInvoiceDto.notes,
          items: { create: itemsData },
        },
        include: {
          items: true,
          client: true,
          user: { select: { firstName: true, lastName: true } },
        },
      });

      return newInvoice;
    });

    return invoice;
  }

  async validate(id: string, userId: string, userRole: Role) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) throw new NotFoundException('Facture non trouvée');
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Seules les factures brouillon peuvent être validées');
    }

    if (userRole === Role.VENDEUSE && invoice.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez valider que vos propres factures');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of invoice.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) {
            throw new BadRequestException(`Stock insuffisant pour ${item.name}`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: StockMovementType.OUT,
              quantity: item.quantity,
              reason: `Vente - Facture ${invoice.invoiceNumber}`,
              userId,
            },
          });
        }
      }

      await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.VALIDATED,
          validatedAt: new Date(),
        },
      });
    });

    return this.findOne(id, userId, userRole);
  }

  async findAll(userId: string, userRole: Role, filters?: any) {
    const where: any = {};

    if (userRole === Role.VENDEUSE) {
      where.userId = userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        client: true,
        user: { select: { firstName: true, lastName: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
      },
    });

    if (!invoice) throw new NotFoundException('Facture non trouvée');

    if (userRole === Role.VENDEUSE && invoice.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return invoice;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const settings = await this.prisma.settings.findFirst();
    if (!settings) {
      throw new Error('Settings not found. Please run database seed.');
    }
    const prefix = settings.invoicePrefix || 'JS';
    const nextNumber = settings.nextInvoiceNumber || 1;

    await this.prisma.settings.update({
      where: { id: settings.id },
      data: { nextInvoiceNumber: nextNumber + 1 },
    });

    return `${prefix}${String(nextNumber).padStart(6, '0')}`;
  }
}
