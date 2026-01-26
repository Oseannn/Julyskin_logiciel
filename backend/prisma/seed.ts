import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const hashedPasswordVendeuse = await bcrypt.hash('Vendeuse123!', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@julesskin.com' },
    update: {},
    create: {
      email: 'admin@julesskin.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Jules Skin',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Create Vendeuse
  const vendeuse = await prisma.user.upsert({
    where: { email: 'vendeuse@julesskin.com' },
    update: {},
    create: {
      email: 'vendeuse@julesskin.com',
      password: hashedPasswordVendeuse,
      firstName: 'Marie',
      lastName: 'Dupont',
      role: Role.VENDEUSE,
      isActive: true,
    },
  });

  // Create Categories
  const categoryVisage = await prisma.category.upsert({
    where: { name: 'Soins Visage' },
    update: {},
    create: {
      name: 'Soins Visage',
      description: 'Produits pour le soin du visage',
    },
  });

  const categoryCorps = await prisma.category.upsert({
    where: { name: 'Soins Corps' },
    update: {},
    create: {
      name: 'Soins Corps',
      description: 'Produits pour le soin du corps',
    },
  });

  const categoryMaquillage = await prisma.category.upsert({
    where: { name: 'Maquillage' },
    update: {},
    create: {
      name: 'Maquillage',
      description: 'Produits de maquillage',
    },
  });

  // Create Products
  await prisma.product.createMany({
    data: [
      {
        name: 'Crème Hydratante Visage',
        description: 'Crème hydratante pour tous types de peaux',
        sellingPrice: 35.99,
        purchasePrice: 18.50,
        stock: 25,
        alertThreshold: 5,
        categoryId: categoryVisage.id,
      },
      {
        name: 'Sérum Anti-Âge',
        description: 'Sérum concentré anti-rides',
        sellingPrice: 59.99,
        purchasePrice: 30.00,
        stock: 15,
        alertThreshold: 3,
        categoryId: categoryVisage.id,
      },
      {
        name: 'Lait Corps Nourrissant',
        description: 'Lait hydratant pour le corps',
        sellingPrice: 24.99,
        purchasePrice: 12.00,
        stock: 30,
        alertThreshold: 10,
        categoryId: categoryCorps.id,
      },
      {
        name: 'Rouge à Lèvres Mat',
        description: 'Rouge à lèvres longue tenue',
        sellingPrice: 19.99,
        purchasePrice: 8.50,
        stock: 40,
        alertThreshold: 8,
        categoryId: categoryMaquillage.id,
      },
      {
        name: 'Fond de Teint',
        description: 'Fond de teint haute couvrance',
        sellingPrice: 32.99,
        purchasePrice: 16.00,
        stock: 20,
        alertThreshold: 5,
        categoryId: categoryMaquillage.id,
      },
    ],
    skipDuplicates: true,
  });

  // Create Services
  await prisma.service.createMany({
    data: [
      {
        name: 'Soin Visage Complet',
        description: 'Nettoyage, gommage, masque et massage',
        duration: 60,
        price: 65.00,
      },
      {
        name: 'Épilation Sourcils',
        description: 'Épilation et mise en forme des sourcils',
        duration: 15,
        price: 12.00,
      },
      {
        name: 'Massage Relaxant',
        description: 'Massage corps complet relaxant',
        duration: 90,
        price: 85.00,
      },
      {
        name: 'Manucure',
        description: 'Soin des mains et pose de vernis',
        duration: 45,
        price: 35.00,
      },
      {
        name: 'Pédicure',
        description: 'Soin des pieds et pose de vernis',
        duration: 60,
        price: 45.00,
      },
    ],
    skipDuplicates: true,
  });

  // Create Clients
  await prisma.client.createMany({
    data: [
      {
        firstName: 'Sophie',
        lastName: 'Martin',
        phone: '0612345678',
        email: 'sophie.martin@email.com',
      },
      {
        firstName: 'Julie',
        lastName: 'Bernard',
        phone: '0623456789',
        email: 'julie.bernard@email.com',
      },
      {
        firstName: 'Claire',
        lastName: 'Dubois',
        phone: '0634567890',
      },
    ],
    skipDuplicates: true,
  });

  // Create Settings
  await prisma.settings.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      shopName: 'Jules Skin',
      shopAddress: '123 Rue de la Beauté, 75001 Paris',
      shopPhone: '01 23 45 67 89',
      shopEmail: 'contact@julesskin.com',
      defaultTaxRate: 20,
      invoicePrefix: 'JS',
      nextInvoiceNumber: 1,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin:', admin.email);
  console.log('👤 Vendeuse:', vendeuse.email);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
