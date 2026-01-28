import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ServicesModule } from './services/services.module';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { SettingsModule } from './settings/settings.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ServicesModule,
    ClientsModule,
    InvoicesModule,
    SettingsModule,
    StatsModule,
  ],
})
export class AppModule {}
