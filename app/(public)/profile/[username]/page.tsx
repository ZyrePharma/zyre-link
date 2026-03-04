import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Linkedin, Github, Globe, Download, UserPlus } from "lucide-react";
import Link from "next/link";

interface ProfilePageProps {
  params: { username: string };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  const profile = await prisma.profile.findUnique({
    where: { username, isActive: true },
    include: {
      user: { select: { email: true, name: true } },
      contactMethods: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } },
      socialLinks: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } },
      customLinks: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } },
    },
  });

  if (!profile) {
    notFound();
  }

  // Track view (simple implementation)
  await prisma.profileView.create({
    data: {
      profileId: profile.id,
      sourceType: "DIRECT",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6">
      <Card className="w-full max-w-sm overflow-hidden shadow-xl border-none">
        {/* Cover Photo */}
        <div 
          className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative"
          style={profile.coverPhotoUrl ? { backgroundImage: `url(${profile.coverPhotoUrl})`, backgroundSize: 'cover' } : {}}
        >
          {/* Profile Photo */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.profilePhotoUrl || ""} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardHeader className="pt-16 pb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-blue-600 font-medium">{profile.jobTitle}</p>
          <p className="text-sm text-gray-500">{profile.department}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {profile.bio && (
            <p className="text-sm text-gray-600 text-center px-4">
              {profile.bio}
            </p>
          )}

          <div className="flex justify-center gap-4">
            <Button className="rounded-full px-6 shadow-md">
              <UserPlus className="mr-2 h-4 w-4" />
              Save Contact
            </Button>
            <Button variant="outline" className="rounded-full shadow-sm" asChild>
              <Link href={`/api/vcard/${profile.username}`}>
                <Download className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Contact</h3>
            <div className="grid grid-cols-1 gap-2">
              {profile.contactMethods.map((method: any) => (
                <a
                  key={method.id}
                  href={method.type === 'PHONE' ? `tel:${method.value}` : method.type === 'EMAIL' ? `mailto:${method.value}` : '#'}
                  className="flex items-center p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm mr-3">
                    {method.type === 'PHONE' && <Phone className="h-4 w-4 text-blue-600" />}
                    {method.type === 'EMAIL' && <Mail className="h-4 w-4 text-blue-600" />}
                    {method.type === 'ADDRESS' && <MapPin className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">{method.label || method.type}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{method.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {profile.socialLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Socials</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {profile.socialLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    {link.platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                    {link.platform === 'github' && <Github className="h-5 w-5" />}
                    {link.platform === 'website' && <Globe className="h-5 w-5" />}
                  </a>
                ))}
              </div>
            </div>
          )}

          {profile.customLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Links</h3>
              <div className="space-y-2">
                {profile.customLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{link.title}</span>
                    <Globe className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </CardContent>
        
        <div className="bg-gray-100 p-4 text-center">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase">Powered by ZYRE LINK</p>
        </div>
      </Card>
      
      <div className="mt-8 text-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/directory">Back to Company Directory</Link>
        </Button>
      </div>
    </div>
  );
}
