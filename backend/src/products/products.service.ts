import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    
    if (!product) {
      throw new BadRequestException('Produit non trouvé');
    }
    
    return product;
  }

  async create(data: CreateProductDto) {
    try {
      // Vérifier que la catégorie existe
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Catégorie non trouvée');
      }

      // Utiliser SQL brut pour éviter le problème de validation Prisma
      const result = await this.prisma.$queryRaw`
        INSERT INTO products (id, name, description, "sellingPrice", "purchasePrice", stock, "isActive", "categoryId", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${data.name},
          ${data.description || null},
          ${data.sellingPrice}::integer,
          0,
          ${data.stock}::integer,
          ${data.isActive ?? true},
          ${data.categoryId}::uuid,
          NOW(),
          NOW()
        )
        RETURNING *
      `;

      // Récupérer le produit créé avec sa catégorie
      const products: any = result;
      if (products && products.length > 0) {
        return await this.prisma.product.findUnique({
          where: { id: products[0].id },
          include: { category: true },
        });
      }

      throw new BadRequestException('Erreur lors de la création du produit');
    } catch (error) {
      console.error('Erreur service création produit:', error);
      throw new BadRequestException(error.message || 'Erreur lors de la création du produit');
    }
  }

  async update(id: string, data: UpdateProductDto) {
    try {
      // Vérifier que le produit existe
      await this.findOne(id);

      // Si categoryId est fourni, vérifier qu'elle existe
      if (data.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw new BadRequestException('Catégorie non trouvée');
        }
      }

      return await this.prisma.product.update({
        where: { id },
        data,
        include: { category: true },
      });
    } catch (error) {
      throw new BadRequestException(error.message || 'Erreur lors de la mise à jour du produit');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(error.message || 'Erreur lors de la suppression du produit');
    }
  }
}
