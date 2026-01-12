import { PrismaClient } from '@prisma/client';
import { AmenitiesSeed } from './AmenitiesSeed.js';
import { BedTypeSeed } from './BedTypeSeed.js';
import { CancellationPolicySeed } from './CancellationPolicySeed.js';
import { CommonSeed } from './CommonSeed.js';
import { CountryStateCitySeed } from './CountryStateCitySeed.js';
import { CurrencySeed } from './CurrencySeed.js';
import { PropertyTypeSeed } from './PropertyTypeSeed.js';
import { SpaceTypeSeed } from './SpaceTypeSeed.js';

// import more as needed
const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
  const tables = await prisma.$queryRaw`SHOW TABLES`;
  for (const table of tables) {
    const tableName = Object.values(table)[0];
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\``);
    console.log(`✅ clear table: ${tableName}`);
  }
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
}

async function resetAutoIncrement() {
  const tables = await prisma.$queryRaw`SHOW TABLES`;
  for (const table of tables) {
    const tableName = Object.values(table)[0];
    await prisma.$executeRawUnsafe(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1`);
    console.log(`✅ clear auto-increment: ${tableName}`);
  }
}

async function main() {
  await clearDatabase();
  await resetAutoIncrement();

  await CommonSeed(prisma);
  await PropertyTypeSeed(prisma);
  await SpaceTypeSeed(prisma);
  await AmenitiesSeed(prisma);
  await BedTypeSeed(prisma);
  await CurrencySeed(prisma);
  await CountryStateCitySeed(prisma);
  await CancellationPolicySeed(prisma);
}

main()
  .then(async () => {
    console.log('✅ All seeding complete.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
