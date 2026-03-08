import { Metadata } from 'next';
import { CompaniesClient } from './companies-client';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Companies | Zyre Admin',
  description: 'Manage companies and their card templates',
};

export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        _count: {
            select: { users: true }
        }
    }
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
      </div>
      <CompaniesClient initialCompanies={companies} />
    </div>
  );
}
