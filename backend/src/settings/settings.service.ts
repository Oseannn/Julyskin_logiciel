import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.settings.findFirst();
    
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          shopName: 'Jules Skin',
          defaultTaxRate: 20,
          invoicePrefix: 'JS',
          nextInvoiceNumber: 1,
        },
      });
    }

    return settings;
  }

  async update(updateSettingsDto: UpdateSettingsDto) {
    const settings = await this.get();
    
    return this.prisma.settings.update({
      where: { id: settings.id },
      data: updateSettingsDto,
    });
  }
}
