import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Download, ChevronRight, Globe, Linkedin, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/profile/share-button";

export function CardLayout({ profile, allLinks, getIcon, getUrl }: any) {
  return (
    <div className="w-full md:max-w-md bg-neutral-100 min-h-screen md:min-h-0 md:rounded-[2rem] md:my-4 overflow-hidden flex flex-col relative text-black p-4 gap-4">
      
      {/* Profile Card */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-white flex flex-col items-center relative overflow-hidden">
        <div className="w-full h-32 bg-neutral-100 relative overflow-hidden">
          {profile.coverPhotoUrl ? (
            <Image
              src={profile.coverPhotoUrl}
              alt="Cover"
              fill
              className="object-cover transition-transform duration-700"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-white flex items-center justify-center">
              {profile.user.company?.logoUrl ? (
                <div className="relative h-20 w-64 px-4">
                  <Image 
                    src={profile.user.company.logoUrl} 
                    alt={profile.user.company.name || "Company Logo"} 
                    fill 
                    className="object-contain filter drop-shadow-xl"
                    priority
                  />
                </div>
              ) : (
                <h1 className="text-primary text-3xl font-black tracking-widest opacity-90 select-none">
                  {profile.user.company?.name?.toUpperCase() || "ZYRE"}
                </h1>
              )}
            </div>
          )}
          <div className="absolute top-4 right-4 z-10">
            <ShareButton 
              username={profile.username} 
              hasBannerImage={!!profile.coverPhotoUrl} 
            />
          </div>
        </div>

        <div className="px-8 pb-8 pt-0 flex flex-col items-center -mt-14 w-full">
        
        <Avatar className="h-28 w-28 ring-4 ring-neutral-50 shadow-lg relative z-10">
          <AvatarImage src={profile.profilePhotoUrl || ""} />
          <AvatarFallback className="bg-neutral-100 text-primary text-2xl font-black">
            {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
          </AvatarFallback>
        </Avatar>

        <div className="mt-6 text-center z-10 w-full">
          <h2 className="text-2xl font-black tracking-tight">{profile.firstName} {profile.lastName}</h2>
          <p className="text-primary font-bold text-[10px] uppercase tracking-widest mt-1 bg-primary/5 px-3 py-1 rounded-full inline-block">{profile.jobTitle || "Professional"}</p>
          
          <p className="mt-4 text-[12px] text-gray-600 font-medium leading-relaxed max-w-[250px] mx-auto">
            {profile.bio || `I'm ${profile.firstName}! Connecting with me is just a tap away.`}
          </p>

          {/* Explicit Contact Info */}
          <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
            {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
              <div key={method.id} className="flex items-center gap-1.5 text-[11px] font-bold text-primary/80">
                <div className="h-3 w-3 flex items-center justify-center scale-75 opacity-70">
                  {getIcon(method.type)}
                </div>
                <span>{method.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-neutral-100" />

        <div className="w-full flex flex-wrap gap-4 py-6 justify-center px-4">
          {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
            <a 
              key={method.id}
              href={getUrl(method)} 
              target={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "_blank" : undefined}
              rel={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "noopener noreferrer" : undefined}
              className="h-14 w-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary shadow-md transition-all active:scale-95 active:bg-slate-50"
              title={method.label || method.type}
            >
              <div className="scale-110">
                {getIcon(method.type)}
              </div>
            </a>
          ))}
          {/* Always add SMS for PHONES if any */}
          {profile.contactMethods.filter((m: any) => m.isVisible && m.type === 'PHONE').slice(0, 1).map((method: any) => (
            <a 
              key={`sms-${method.id}`}
              href={`sms:${method.value}`} 
              className="h-14 w-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary shadow-md transition-all active:scale-95 active:bg-slate-50"
              title="SMS"
            >
              <MessageSquare className="h-6 w-6" />
            </a>
          ))}
        </div>
        </div>
      </div>

      <a href={`/api/vcard/${profile.username}`} className="block">
        <div className="bg-primary rounded-[2rem] p-4 shadow-2xl flex items-center justify-between transition-all active:scale-[0.98] border-2 border-primary/20">
          <div className="flex flex-col">
              <h3 className="text-primary-foreground font-black text-base uppercase tracking-tighter">Save Contact</h3>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
              <Download className="h-5 w-5" />
          </div>
        </div>
      </a>

      {/* Links Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {allLinks.map((item: any) => (
            <a 
                key={item.id}
                href={getUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-3xl p-3 shadow-md border border-white transition-all flex flex-col items-center text-center gap-2 active:scale-95"
            >
                <div className="h-8 w-8 flex items-center justify-center text-primary bg-primary/5 rounded-xl">
                    {getIcon(item.type, item.platform)}
                </div>
                <span className="text-xs font-black uppercase tracking-tight truncate w-full px-2">
                    {item.title || item.label || item.platform || 'Link'}
                </span>
                <ArrowUpRight className="h-2.5 w-2.5 text-neutral-300 absolute top-4 right-4" />
            </a>
        ))}
      </div>

      <div className="mt-auto py-6 text-center">
        <p className="text-[10px] font-black text-neutral-300 tracking-[1em] uppercase">ZYRE LINK</p>
      </div>
    </div>
  );
}
