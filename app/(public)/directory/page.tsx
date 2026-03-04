import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Mail, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";

interface DirectoryPageProps {
  searchParams: Promise<{ q?: string; dept?: string }>;
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const dept = params.dept || "";

  const profiles = await prisma.profile.findMany({
    where: {
      isActive: true,
      showInDirectory: true,
      ...(q && {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { jobTitle: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(dept && { department: dept }),
    },
    include: {
      user: { select: { email: true } },
    },
    orderBy: { lastName: 'asc' },
  });

  const departments = await prisma.profile.groupBy({
    by: ['department'],
    where: { isActive: true, department: { not: null } },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
            <p className="text-gray-500">Connect with your colleagues across the company</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name or title..." 
              className="pl-10"
              defaultValue={q}
              // In a real app, we'd use a client component for search handling
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {dept || "All Departments"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.length > 0 ? (
            profiles.map((profile: any) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-6 flex items-start space-x-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={profile.profilePhotoUrl || ""} alt={`${profile.firstName} ${profile.lastName}`} />
                    <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900 truncate">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      <Link href={`/profile/${profile.username}`} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                    <p className="text-sm text-blue-600 font-medium truncate">{profile.jobTitle}</p>
                    <p className="text-xs text-gray-500 mb-4">{profile.department}</p>
                    
                    <div className="flex items-center space-x-3">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" asChild>
                         <a href={`mailto:${profile.user.email}`}><Mail className="h-4 w-4" /></a>
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                         <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="ml-auto text-xs" asChild>
                        <Link href={`/profile/${profile.username}`}>View Card</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed">
              <p className="text-gray-500">No employees found matching your search.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
