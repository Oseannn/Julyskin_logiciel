import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll() {
    try {
      return await this.productsService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des produits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.productsService.findOne(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Produit non trouvé',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  async create(@Body() data: CreateProductDto) {
    try {
      return await this.productsService.create(data);
    } catch (error) {
      console.error('Erreur création produit:', error);
      throw new HttpException(
        error.message || 'Erreur lors de la création du produit',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    try {
      return await this.productsService.update(id, data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la mise à jour du produit',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.productsService.remove(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la suppression du produit',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
