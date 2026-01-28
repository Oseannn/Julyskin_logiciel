import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Role, InvoiceStatus, StockMovementType, ServiceBillingType, InvoiceLineType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string) {
    const settings = await this.prisma.settings.findFirst();
    const taxRate = createInvoiceDto.taxRate || settings?.defaultTaxRate || new Decimal(20);

    let subtotal = new Decimal(0);
    const linesData: Array<{
      type: InvoiceLineType;
      productId?: string;
      serviceId?: string;
      name: string;
      quantity?: number;
      duration?: number;
      unitPrice: Decimal;
      total: Decimal;
    }> = [];

    for (const item of createInvoiceDto.items) {
      if (item.productId) {
        // PRODUIT
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Produit ${item.productId} non trouvé`);
        
        if (!item.quantity || item.quantity < 1) {
          throw new BadRequestException(`Quantité requise pour le produit ${product.name}`);
        }
        
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuffisant pour ${product.name}`);
        }

        const lineTotal = new Decimal(product.sellingPrice).mul(item.quantity);
        subtotal = subtotal.add(lineTotal);

        linesData.push({
          type: InvoiceLineType.PRODUCT,
          productId: item.productId,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
          total: lineTotal,
        });

      } else if (item.serviceId) {
        // SERVICE
        const service = await this.prisma.service.findUnique({ where: { id: item.serviceId } });
        if (!service) throw new NotFoundException(`Service ${item.serviceId} non trouvé`);

        let lineTotal: Decimal;
        let duration: number | undefined;

        switch (service.billingType) {
          case ServiceBillingType.PAR_MINUTE:
            if (!item.duration || item.duration < 1) {
              throw new BadRequestException(`Durée requise pour le service ${service.name} (facturé à la minute)`);
            }
            if (service.minDuration && item.duration < service.minDuration) {
              throw new BadRequestException(`Durée minimale de ${service.minDuration} minutes pour ${service.name}`);
            }
            duration = item.duration;
            lineTotal = new Decimal(service.unitPrice).mul(duration);
            break;

          case ServiceBillingType.PAR_HEURE:
            if (!item.duration || item.duration < 1) {
              throw new BadRequestException(`Durée requise pour le service ${service.name} (facturé à l'heure)`);
            }
            if (service.minDuration && item.duration < service.minDuration) {
              throw new BadRequestException(`Durée minimale de ${service.minDuration} minutes pour ${service.name}`);
            }
            duration = item.duration;
            // Convertir minutes en heures et multiplier par le prix horaire
            const hours = new Decimal(duration).div(60);
            lineTotal = new Decimal(service.unitPrice).mul(hours);
            break;

          case ServiceBillingType.FORFAIT:
            // Prix fixe, pas de durée
            duration = undefined;
            lineTotal = new Decimal(service.unitPrice);
            break;

          default:
            throw new BadRequestException(`Type de facturation inconnu pour ${service.name}`);
        }

        subtotal = subtotal.add(lineTotal);

        linesData.push({
          type: InvoiceLineType.SERVICE,
          serviceId: item.serviceId,
          name: service.name,
          duration,
          unitPrice: service.unitPrice,
          total: lineTotal,
        });

      } else {
        throw new BadRequestException('Chaque ligne doit avoir un productId ou serviceId');
      }
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
          lines: { create: linesData },
        },
        include: {
          lines: true,
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
      include: { lines: true },
    });

    if (!invoice) throw new NotFoundException('Facture non trouvée');
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Seules les factures brouillon peuvent être validées');
    }

    if (userRole === Role.VENDEUSE && invoice.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez valider que vos propres factures');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const line of invoice.lines) {
        if (line.type === InvoiceLineType.PRODUCT && line.productId) {
          const product = await tx.product.findUnique({ where: { id: line.productId } });
          if (!product || (line.quantity && product.stock < line.quantity)) {
            throw new BadRequestException(`Stock insuffisant pour ${line.name}`);
          }

          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { decrement: line.quantity || 0 } },
          });

          await tx.stockMovement.create({
            data: {
              productId: line.productId,
              type: StockMovementType.OUT,
              quantity: line.quantity || 0,
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
        lines: true,
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
        lines: {
          include: {
            product: true,
            service: true,
          },
        },
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
