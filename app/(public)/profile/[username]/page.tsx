import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Linkedin, Github, Globe, Download, UserPlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  
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

  // Track view
  await prisma.profileView.create({
    data: {
      profileId: profile.id,
      sourceType: "DIRECT",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex flex-col items-center py-0 sm:py-8 md:py-12 px-0 sm:px-6 light text-foreground">
      <Card className="w-full max-w-lg overflow-hidden shadow-none sm:shadow-2xl border-0 bg-card text-card-foreground rounded-none sm:rounded-3xl">
        {/* Cover Photo — Taller, with gradient overlay */}
        <div className="relative">
          <div 
            className="h-52 md:h-64 relative"
            style={{ backgroundImage: `url(${profile.coverPhotoUrl || "/zyre-banner.jpg"})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            {/* Gradient overlay at bottom for smooth blend */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
            
            {/* Primary accent stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          </div>

          {/* Profile Photo — Overlapping with cover */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <Avatar className="h-32 w-32 border-4 border-card shadow-xl ring-2 ring-primary/10">
              <AvatarImage src={profile.profilePhotoUrl || ""} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Identity Section */}
        <CardHeader className="pt-20 pb-2 text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-primary/80 font-semibold text-sm md:text-base">{profile.jobTitle}</p>
          {profile.department && (
            <p className="text-xs text-muted-foreground font-medium">{profile.department}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-6 px-5 md:px-6 pb-6">
          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center px-2 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <Button className="rounded-full px-6 shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg">
              <UserPlus className="mr-2 h-4 w-4" />
              Save Contact
            </Button>
            <Button variant="outline" className="rounded-full shadow-sm border-primary/20 hover:bg-primary/5" asChild>
              <Link href={`/api/vcard/${profile.username}`}>
                <Download className="h-4 w-4 text-primary/70" />
              </Link>
            </Button>
          </div>

          {/* Contact Methods */}
          {profile.contactMethods.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Contact</h3>
              <div className="grid grid-cols-1 gap-2">
                {profile.contactMethods.map((method: any) => (
                  <a
                    key={method.id}
                    href={method.type === 'PHONE' ? `tel:${method.value}` : method.type === 'EMAIL' ? `mailto:${method.value}` : '#'}
                    className="flex items-center p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all group border border-transparent hover:border-primary/10"
                  >
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm mr-3 group-hover:shadow-md transition-shadow">
                      {method.type === 'PHONE' && <Phone className="h-4 w-4 text-primary/70" />}
                      {method.type === 'EMAIL' && <Mail className="h-4 w-4 text-primary/70" />}
                      {method.type === 'ADDRESS' && <MapPin className="h-4 w-4 text-primary/70" />}
                      {!['PHONE', 'EMAIL', 'ADDRESS'].includes(method.type) && <Globe className="h-4 w-4 text-primary/70" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{method.label || method.type}</p>
                      <p className="text-sm font-medium truncate">{method.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Socials</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {profile.socialLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 w-12 rounded-2xl bg-primary/5 text-primary/70 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md hover:scale-105"
                  >
                    {link.platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                    {link.platform === 'github' && <Github className="h-5 w-5" />}
                    {link.platform === 'website' && <Globe className="h-5 w-5" />}
                    {!['linkedin', 'github', 'website'].includes(link.platform) && <ExternalLink className="h-5 w-5" />}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Custom Links */}
          {profile.customLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Links</h3>
              <div className="space-y-2">
                {profile.customLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-all group hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary/90 transition-colors">{link.title}</span>
                      {link.description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{link.description}</p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary/50 shrink-0 ml-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Footer */}
        <div className="bg-muted/30 p-4 text-center border-t border-border/50">
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
            Powered by <span className="font-bold">ZYRE</span> <span className="text-primary/80 font-bold">LINK</span>
          </p>
        </div>
      </Card>
      
      {session && (
        <div className="mt-6 text-center pb-8 sm:pb-0">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary/80 text-xs">
            <Link href="/directory">Back to Company Directory</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
