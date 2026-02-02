const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Users
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const vendeusePassword = await bcrypt.hash('Vendeuse123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@julesskin.com' },
    update: {},
    create: {
      email: 'admin@julesskin.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Jules Skin',
      role: 'ADMIN',
    },
  });

  const vendeuse = await prisma.user.upsert({
    where: { email: 'vendeuse@julesskin.com' },
    update: {},
    create: {
      email: 'vendeuse@julesskin.com',
      password: vendeusePassword,
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'VENDEUSE',
    },
  });

  console.log('✅ Users created');

  // Categories
  const skincare = await prisma.category.upsert({
    where: { name: 'Soins visage' },
    update: {},
    create: {
      name: 'Soins visage',
      description: 'Produits pour le visage',
    },
  });

  const bodycare = await prisma.category.upsert({
    where: { name: 'Soins corps' },
    update: {},
    create: {
      name: 'Soins corps',
      description: 'Produits pour le corps',
    },
  });

  console.log('✅ Categories created');

  // Products
  await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Crème hydratante',
      description: 'Crème visage hydratante',
      sellingPrice: 35.00,
      purchasePrice: 15.00,
      stock: 50,
      categoryId: skincare.id,
    },
  });

  await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Sérum anti-âge',
      description: 'Sérum concentré',
      sellingPrice: 65.00,
      purchasePrice: 30.00,
      stock: 30,
      categoryId: skincare.id,
    },
  });

  await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Lait corporel',
      description: 'Hydratation corps',
      sellingPrice: 25.00,
      purchasePrice: 10.00,
      stock: 40,
      categoryId: bodycare.id,
    },
  });

  console.log('✅ Products created');

  // Services
  await prisma.service.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Massage relaxant',
      description: 'Massage complet du corps',
      billingType: 'PAR_HEURE',
      unitPrice: 60.00,
      minDuration: 30,
    },
  });

  await prisma.service.upsert({
    where: { id: '00000000-0000-0000-0000-000000000012' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000012',
      name: 'Épilation',
      description: 'Épilation à la cire',
      billingType: 'PAR_MINUTE',
      unitPrice: 0.80,
      minDuration: 15,
    },
  });

  await prisma.service.upsert({
    where: { id: '00000000-0000-0000-0000-000000000013' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000013',
      name: 'Soin visage complet',
      description: 'Nettoyage + masque + massage',
      billingType: 'FORFAIT',
      unitPrice: 65.00,
    },
  });

  console.log('✅ Services created');

  // Clients
  const client1 = await prisma.client.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      firstName: 'Sophie',
      lastName: 'Martin',
      phone: '0612345678',
      email: 'sophie.martin@email.com',
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: '00000000-0000-0000-0000-000000000022' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000022',
      firstName: 'Julie',
      lastName: 'Bernard',
      phone: '0623456789',
      email: 'julie.bernard@email.com',
    },
  });

  console.log('✅ Clients created');

  // Settings
  await prisma.settings.upsert({
    where: { id: '00000000-0000-0000-0000-000000000031' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000031',
      shopName: 'Jules Skin',
      shopAddress: '123 Rue de la Beauté, 75001 Paris',
      shopPhone: '0145678901',
      shopEmail: 'contact@julesskin.com',
      defaultTaxRate: 20,
      invoicePrefix: 'INV',
      nextInvoiceNumber: 1,
    },
  });

  console.log('✅ Settings created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
