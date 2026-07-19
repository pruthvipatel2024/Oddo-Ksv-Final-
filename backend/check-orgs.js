require('ts-node').register();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({ include: { organization: true } });
  users.forEach(u => console.log(u.email, '->', u.organization?.name || 'NO ORG'));
  await prisma.$disconnect();
})();
