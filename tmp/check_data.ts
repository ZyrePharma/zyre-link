
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.contactMethod.count({
    where: {
      type: {
        in: ['WEBSITE', 'EXTENSION'] as any
      }
    }
  })
  console.log(`Found ${count} contact methods using WEBSITE or EXTENSION`)
  const records = await prisma.contactMethod.findMany({
    where: {
      type: {
        in: ['WEBSITE', 'EXTENSION'] as any
      }
    },
    select: {
        id: true,
        type: true,
        profileId: true
    }
  })
  console.log(JSON.stringify(records, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
