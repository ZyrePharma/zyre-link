export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import CardDesign from "@/components/admin/card-design";

export default async function CardDirectoryPage() {
  const [users, company] = await Promise.all([
    prisma.user.findMany({
      where: {
        profile: { isNot: null },
        nfcCards: { some: {} }
      },
      include: {
        profile: true,
        nfcCards: true,
        company: true
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.company.findFirst()
  ]);

  const directoryUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile ? {
      username: user.profile.username,
      jobTitle: user.profile.jobTitle,
    } : null,
    // Just grab the first assigned card if available for the UID
    cardUid: user.nfcCards?.[0]?.cardUid || null,
    company: user.company ? {
      name: user.company.name,
      logoUrl: user.company.logoUrl,
      cardTemplateUrl: user.company.cardTemplateUrl,
    } : null
  }));

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Card Designs</h1>
        
      </div>

      <CardDesign 
        users={directoryUsers} 
        templateUrl={company?.cardTemplateUrl || null} 
      />
    </div>
  );
}
