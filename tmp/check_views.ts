import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const latestViews = await prisma.profileView.findMany({
    orderBy: { viewedAt: 'desc' },
    take: 5,
    include: {
      profile: {
        select: {
          username: true
        }
      }
    }
  })

  console.log('Latest Profile Views:')
  console.table(latestViews.map(view => ({
    id: view.id,
    profile: view.profile.username,
    source: view.sourceType,
    at: view.viewedAt
  })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
