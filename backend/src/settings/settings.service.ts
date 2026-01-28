import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    return this.prisma.settings.findFirst();
  }

  async update(data: any) {
    const settings = await this.prisma.settings.findFirst();
    return this.prisma.settings.update({
      where: { id: settings.id },
      data,
    });
  }
}
