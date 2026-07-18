import 'dotenv/config';
import { PrismaClient, UserRole, UserType, UserStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/carpooling?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Seed Organizations
  const orgA = await prisma.organization.upsert({
    where: { code: 'CORPA' },
    update: {},
    create: {
      name: 'Company A (Tech Corp)',
      code: 'CORPA',
      address: '123 Tech Park',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
    },
  });
  console.log(`Seeded Organization: ${orgA.name} with code CORPA`);

  const orgB = await prisma.organization.upsert({
    where: { code: 'CORPB' },
    update: {},
    create: {
      name: 'Company B (Finance Solutions)',
      code: 'CORPB',
      address: '456 Financial Hub',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
    },
  });
  console.log(`Seeded Organization: ${orgB.name} with code CORPB`);

  // 2. Seed Super Admin
  const adminEmail = 'admin@carpool.platform';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('AdminPassword123', saltRounds);

    const superAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Platform',
        lastName: 'Admin',
        phone: '+10000000000',
        role: UserRole.SUPER_ADMIN,
        userType: UserType.INTERNAL,
        status: UserStatus.ACTIVE,
        organizationId: null, // Super Admin doesn't belong to any org
      },
    });

    console.log(`Seeded Super Admin user: ${superAdmin.email}`);
  } else {
    console.log('Super Admin user already exists.');
  }

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
