import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function CurrencySeed(prisma) {
  try {
    // Read and execute currency.sql
    const currencysqlFilePath = path.join(__dirname, 'sql/currency.sql');
    const currencysqlData = fs.readFileSync(currencysqlFilePath, 'utf8');
    await prisma.$executeRawUnsafe(currencysqlData);
    console.log('✅ Seed completed: Currency.');
  } catch (error) {
    console.error('❌ Error during seeding process:', error);
  } finally {
    await prisma.$disconnect();
  }
}
