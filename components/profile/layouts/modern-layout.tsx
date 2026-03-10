import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Download, ChevronRight, Globe, Linkedin, Twitter, Instagram, Github, Facebook } from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/profile/share-button";

export function ModernLayout({ profile, allLinks, getIcon, getUrl }: any) {
  return (
    <div className="w-full md:max-w-md bg-white min-h-screen md:min-h-0 md:rounded-[2.5rem] md:shadow-2xl md:my-4 overflow-hidden flex flex-col relative text-gray-900 font-sans">
      {/* Header Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {profile.coverPhotoUrl ? (
          <Image
            src={profile.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover transition-transform duration-700"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-white border-b-2 border-primary flex items-center justify-center">
            {profile.user.company?.logoUrl ? (
              <div className="relative h-24 w-80 px-4">
                <Image 
                  src={profile.user.company.logoUrl} 
                  alt={profile.user.company.name || "Company Logo"} 
                  fill 
                  className="object-contain filter drop-shadow-xl"
                  priority
                />
              </div>
            ) : (
              <h1 className="text-primary text-4xl font-black tracking-widest opacity-90 select-none">
                {profile.user.company?.name?.toUpperCase() || "ZYRE"}
              </h1>
            )}
          </div>
        )}
        <div className="absolute top-6 right-6 z-20">
          <ShareButton 
            username={profile.username} 
            hasBannerImage={!!profile.coverPhotoUrl} 
          />
        </div>
      </div>

      <div className="relative z-10 p-8 pt-0 flex flex-col items-center">
        <div className="-mt-16">
          <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl bg-primary relative">
            <AvatarImage src={profile.profilePhotoUrl || ""} />
            <AvatarFallback className="bg-primary text-white text-3xl font-bold">
              {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-8 text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-gray-900">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-sm font-bold text-primary/80 uppercase tracking-[0.2em]">
            {profile.jobTitle || "Professional"}
          </p>
          <div className="h-1 w-12 bg-primary mx-auto rounded-full mt-4" />
        </div>

        <p className="mt-6 text-sm text-center text-gray-600 px-4 leading-relaxed font-medium">
          {profile.bio || `I'm ${profile.firstName}! Connecting with me is just a tap away.`}
        </p>

        {/* Explicit Contact Info */}
        <div className="mt-4 flex flex-col items-center gap-1">
          {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
            <div key={method.id} className="flex items-center gap-1.5 text-xs font-bold text-primary/80">
              <div className="h-3 w-3 flex items-center justify-center scale-75">
                {getIcon(method.type)}
              </div>
              <span>{method.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-6 mt-10 w-full px-4 justify-center">
          {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
            <a 
              key={method.id}
              href={getUrl(method)} 
              target={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "_blank" : undefined}
              rel={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "noopener noreferrer" : undefined}
              className="flex flex-col items-center gap-2 transition-transform active:scale-95"
              title={method.label || method.type}
            >
              <div className="h-14 w-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary shadow-md">
                <div className="scale-110">
                  {getIcon(method.type)}
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none text-center">
                {method.type === 'PHONE' ? 'Call' : (method.type === 'EMAIL' ? 'Email' : method.label || method.type)}
              </span>
            </a>
          ))}
          {/* Always add SMS for PHONES if any */}
          {profile.contactMethods.filter((m: any) => m.isVisible && m.type === 'PHONE').slice(0, 1).map((method: any) => (
            <a 
              key={`sms-${method.id}`}
              href={`sms:${method.value}`} 
              className="flex flex-col items-center gap-2 transition-transform active:scale-95"
              title="SMS"
            >
              <div className="h-14 w-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary shadow-md">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none text-center">SMS</span>
            </a>
          ))}
        </div>

        <div className="w-full mt-10 space-y-3 px-4">
          <a href={`/api/vcard/${profile.username}`}>
            <Button className="w-full bg-slate-900 text-white rounded-2xl h-16 font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              <Download className="h-5 w-5" />
              Save Contact
            </Button>
          </a>
        </div>

        <div className="w-full mt-12 mb-8">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 px-2">Featured Links</h3>
          <div className="grid grid-cols-1 gap-4">
            {allLinks.map((item: any) => (
              <a
                key={item.id}
                href={getUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm transition-all active:scale-[0.99] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/10" />
                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center mr-4 shrink-0">
                  {getIcon(item.type, item.platform)}
                </div>
                <p className="flex-1 font-bold text-gray-700">
                  {item.title || item.label || item.platform}
                </p>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-all" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pb-4">
          <p className="text-[9px] font-black text-gray-300 tracking-[0.4em] uppercase">
            ZYRE <span className="text-secondary opacity-50">LINK</span>
          </p>
        </div>
      </div>
    </div>
  );
}
