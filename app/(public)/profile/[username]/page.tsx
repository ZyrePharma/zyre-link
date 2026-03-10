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
  const skipTrack = resolvedSearchParams?.skip_track === "true";
  
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

  // Tracking logic
  if (!skipTrack) {
    // If source is provided, use it. Otherwise, default to LINK.
    const sourceType = (sourceParam === "qr" || sourceParam === "nfc") 
      ? sourceParam.toUpperCase() as "QR" | "NFC"
      : "LINK";

    await prisma.profileView.create({
      data: {
        profileId: profile.id,
        sourceType,
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
    
    if (type === 'WHATSAPP' || platform === 'whatsapp') return (
      <svg className="h-5 w-5 fill-[#25D366]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .08 5.365.074 11.967c0 2.112.551 4.17 1.597 6.018L0 24l6.193-1.623c1.776.969 3.785 1.48 5.861 1.48h.005c6.604 0 11.967-5.367 11.97-11.97a11.85 11.85 0 00-3.41-8.445z"/>
      </svg>
    );

    if (type === 'VIBER' || platform === 'viber') return (
      <svg className="h-5 w-5 fill-[#7360f2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.349 14.126c-.461-.431-.922-.435-1.38-.009l-.46.331-.46.332-.46.331c-.461.431-1.381-.004-1.841-.435l-2.028-2.316c-.412-.472-.361-1.442.062-1.89l.461-.318.461-.318.46-.319c.459-.425.461-.887 0-1.319l-.544-.6c-.544-.6-1.088-1.199-1.631-1.799-.46-.425-.921-.425-1.381 0-.174.152-.349.303-.523.455a3.4 3.4 0 0 0-.616.711c-.571.859-.806 1.819-.705 2.88 0 0 .101 1.061.503 2.544.402 1.484 1.208 3.5 3.52 6.155 2.313 2.656 4.321 3.473 5.812 3.882 1.492.41 2.551.521 2.551.521 1.067.132 2.03-.081 2.905-.63 0 0 .285-.18.459-.319.174-.15.349-.301.523-.451.461-.432-.016-.889-.477-1.319l-4.267-4.665zm1.531-5.75c-.297-.473-.787-.796-1.332-.907-.06-.012-.119-.017-.183-.017H19.2c-.443 0-.802.358-.802.802 0 .444.359.802.802.802h.111c.148.016.28.09.356.21.077.119.096.265.05.399l-.04.116c-.15.416-.554.689-.998.689h-.041c-.443 0-.802.358-.802.802 0 .444.359.802.802.802h.105c1.076 0 2.054-.664 2.418-1.674 0 0 .085-.236.13-.362.152-.431.144-.91-.019-1.32zm2.981-2.903c-.633-.923-1.634-1.579-2.774-1.831-.19-.041-.383-.062-.577-.062h-.146c-.443 0-.802.359-.802.802s.359.802.802.802h.146c.995 0 1.942.453 2.571 1.242.63.789.878 1.83.693 2.812-.083.435.21.854.654.945.047.01.095.014.143.014.39 0 .73-.281.793-.678.291-1.547-.101-3.149-1.08-4.575zM12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm0-22c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
      </svg>
    );

    if (type === 'TELEGRAM' || platform === 'telegram') return (
      <svg className="h-5 w-5 fill-[#0088cc]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.891-15.996c-.34-.34-.94-.34-1.306 0L8.711 15.82c-.366.366-.966.366-1.332 0s-.366-.966 0-1.332l7.874-7.874c.366-.366-.366-1.332-1.332-1.332s-.966.366-1.332.6L4.673 13.921c-.366.366-.366 1.332 0 1.698s.966.366 1.332 0l7.874-7.874c.366-.366.966-.366 1.332 0s.366.966 0 1.332L7.337 16.951c-.366.366-.366 1.332 0 1.698s.966.366 1.332 0l7.874-7.874c.366-.366.366-1.332-.352-1.771z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c.18.717-.375 2.193-1.42 4.01-1.045 1.817-2.316 3.195-3.15 3.195-.417 0-.75-.333-.75-.75 0-.125.031-.242.086-.346l.758-1.516c.101-.202.164-.424.164-.658 0-.828-.672-1.5-1.5-1.5-.234 0-.456.063-.658.164l-1.516.758c-.104.055-.221.086-.346.086-.417 0-.75-.333-.75-.75 0-.834 1.378-2.105 3.195-3.15 1.817-1.045 3.293-1.6 4.01-1.42.717.18 1.144.921.877 2.077z"/>
      </svg>
    );
    
    if (type === 'PHONE') return <Phone className="h-5 w-5 text-primary" />;
    if (type === 'EMAIL') return <Mail className="h-5 w-5 text-primary" />;
    if (type === 'ADDRESS') return <MapPin className="h-5 w-5 text-primary" />;
    return <Globe className="h-5 w-5 text-muted-foreground" />;
  };

  const getUrl = (item: any) => {
    if (item.url) return item.url;
    if (item.value) {
      if (item.type === 'PHONE') return `tel:${item.value}`;
      if (item.type === 'EMAIL') return `mailto:${item.value}`;
      if (item.type === 'WHATSAPP') return `https://wa.me/${item.value.replace(/\D/g, '')}`;
      if (item.type === 'VIBER') return `viber://add?number=${item.value.replace(/\D/g, '')}`;
      if (item.type === 'TELEGRAM') return `https://t.me/${item.value.replace(/\D/g, '')}`;
    }
    return '#';
  };

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
