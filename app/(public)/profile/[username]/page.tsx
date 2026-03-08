import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Phone, Mail, MapPin, Globe, Linkedin, Github, Facebook, Instagram, Twitter } from "lucide-react";
import { auth } from "@/auth";
import { AutoDownloadVcf } from "@/components/auto-download-vcf";
import { ClassicLayout } from "@/components/profile/layouts/classic-layout";
import { ModernLayout } from "@/components/profile/layouts/modern-layout";
import { ExecutiveLayout } from "@/components/profile/layouts/executive-layout";
import { SocialLayout } from "@/components/profile/layouts/social-layout";
import { CardLayout } from "@/components/profile/layouts/card-layout";

export default async function PublicProfilePage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;
  const sourceParam = resolvedSearchParams?.source as string | undefined;
  
  const session = await auth();
  
  const profile = await prisma.profile.findUnique({
    where: { username, isActive: true },
    include: {
      user: { 
        select: { 
          email: true, 
          name: true,
          company: {
            select: {
              name: true,
              logoUrl: true
            }
          }
        } 
      },
      contactMethods: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } },
      socialLinks: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } },
      customLinks: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } },
    },
  });

  if (!profile) {
    notFound();
  }

  // Only track view if it's from QR, NFC, or Link
  if (sourceParam === "qr" || sourceParam === "link" || sourceParam === "nfc") {
    await prisma.profileView.create({
      data: {
        profileId: profile.id,
        sourceType: sourceParam.toUpperCase() as any, // QR, LINK, NFC
      },
    });
  }

  // Grouping links for the list
  const allLinks = [
    ...profile.socialLinks.map(s => ({ ...s, category: 'social' })),
    ...profile.customLinks.map(c => ({ ...c, category: 'custom' }))
  ].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const getIcon = (type: string, platform?: string) => {
    if (platform === 'linkedin') return <Linkedin className="h-5 w-5 text-[#0077b5]" />;
    if (platform === 'github') return <Github className="h-5 w-5 text-[#333]" />;
    if (platform === 'facebook') return <Facebook className="h-5 w-5 text-[#1877f2]" />;
    if (platform === 'instagram') return <Instagram className="h-5 w-5 text-[#e4405f]" />;
    if (platform === 'twitter' || platform === 'x') return <Twitter className="h-5 w-5 text-[#1da1f2]" />;
    if (platform === 'website') return <Globe className="h-5 w-5 text-gray-600" />;
    
    if (type === 'PHONE') return <Phone className="h-5 w-5 text-primary" />;
    if (type === 'EMAIL') return <Mail className="h-5 w-5 text-primary" />;
    if (type === 'ADDRESS') return <MapPin className="h-5 w-5 text-primary" />;
    return <Globe className="h-5 w-5 text-muted-foreground" />;
  };

  const getUrl = (item: any) => item.url || '#';

  const layoutProps = { profile, allLinks, getIcon, getUrl };

  const renderLayout = () => {
    switch ((profile as any).layout) {
      case 'modern': return <ModernLayout {...layoutProps} />;
      case 'executive': return <ExecutiveLayout {...layoutProps} />;
      case 'social': return <SocialLayout {...layoutProps} />;
      case 'card': return <CardLayout {...layoutProps} />;
      default: return <ClassicLayout {...layoutProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center md:py-12">
      {profile.autoDownloadVcf && <AutoDownloadVcf username={profile.username} />}
      {renderLayout()}
    </div>
  );
}
