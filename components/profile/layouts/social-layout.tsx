import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Download, ChevronRight, Share2, Instagram, Twitter, Linkedin, Github, Facebook, Youtube } from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/profile/share-button";

export function SocialLayout({ profile, allLinks, getIcon, getUrl }: any) {
  return (
    <div className="w-full md:max-w-md bg-slate-50 min-h-screen md:min-h-0 md:rounded-[3rem] md:shadow-2xl md:my-4 overflow-hidden flex flex-col relative text-slate-900">
      
      {/* Header Banner */}
      <div className="relative h-56 w-full overflow-hidden border-b-2 border-primary">
        {profile.coverPhotoUrl ? (
          <Image
            src={profile.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover opacity-60 transition-transform duration-700"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-white flex items-center justify-center border-b border-slate-100">
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
              <h1 className="text-primary text-4xl font-black tracking-widest opacity-20 select-none">
                {profile.user.company?.name?.toUpperCase() || "ZYRE"}
              </h1>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
        
        <div className="absolute top-6 right-6 z-20">
          <ShareButton 
            username={profile.username} 
            hasBannerImage={!!profile.coverPhotoUrl} 
          />
        </div>
      </div>

      <div className="relative z-10 px-8 flex flex-col items-center -mt-20 pb-12">

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-40 transition duration-1000" />
          <Avatar className="h-36 w-36 border-4 border-white relative rounded-full shadow-2xl">
            <AvatarImage src={profile.profilePhotoUrl || ""} />
            <AvatarFallback className="bg-slate-100 text-primary text-3xl font-bold">
              {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            {profile.firstName} {profile.lastName}
          </h2>
          {profile.jobTitle && (
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1">
              {profile.jobTitle}
            </p>
          )}
          <p className="mt-4 text-slate-600 font-medium leading-relaxed">{profile.bio || `I'm ${profile.firstName}! Sharing my journey and connecting with you! ✨`}</p>

          {/* Explicit Contact Info */}
          <div className="mt-4 flex flex-col items-center gap-1.5">
            {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
              <div key={method.id} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <div className="h-3 w-3 flex items-center justify-center scale-75 opacity-60">
                  {getIcon(method.type)}
                </div>
                <span>{method.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full mt-10 grid grid-cols-1 gap-4">
           {allLinks.map((item: any) => (
              <a
                key={item.id}
                href={getUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm active:shadow-md transition-all active:scale-95"
              >
                <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center transition-colors text-slate-400">
                  {getIcon(item.type, item.platform)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 tracking-wide uppercase text-xs">{item.title || item.label || item.platform || item.type?.toLowerCase().replace('_', ' ')}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Click to visit</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </a>
           ))}
        </div>

        <div className="w-full mt-12 mb-8">
           <a href={`/api/vcard/${profile.username}`}>
             <Button className="w-full h-16 bg-primary text-primary-foreground rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95">
                <Download className="h-5 w-5" />
                Get My Contact
             </Button>
           </a>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
            <a 
              key={method.id}
              href={getUrl(method)} 
              target={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "_blank" : undefined}
              rel={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "noopener noreferrer" : undefined}
              className="h-14 w-14 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-primary shadow-md transition-all active:scale-95 active:bg-slate-50 active:border-primary/20 active:shadow-sm"
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
              className="h-14 w-14 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-primary shadow-md transition-all active:scale-95 active:bg-slate-50 active:border-primary/20 active:shadow-sm"
              title="SMS"
            >
              <MessageSquare className="h-6 w-6" />
            </a>
          ))}
        </div>

        <div className="mt-12 opacity-30">
          <p className="text-[10px] font-black tracking-[0.5em] text-slate-400">ZYRE LINK</p>
        </div>
      </div>
    </div>
  );
}
