import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.service.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}
