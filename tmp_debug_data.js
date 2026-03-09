const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      company: true,
      profile: true,
      nfcCards: true
    }
  });
  console.log('--- USERS ---');
  console.log(JSON.stringify(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    companyId: u.companyId,
    companyName: u.company?.name,
    cardTemplateUrl: u.company?.cardTemplateUrl
  })), null, 2));

  const companies = await prisma.company.findMany();
  console.log('--- COMPANIES ---');
  console.log(JSON.stringify(companies, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
