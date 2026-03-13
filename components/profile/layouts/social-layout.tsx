import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Download, ChevronRight, Share2, Instagram, Twitter, Linkedin, Github, Facebook, Youtube, Briefcase, Languages } from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/profile/share-button";

export function SocialLayout({ profile, allLinks, getIcon, getUrl }: any) {
  const phoneMethod = profile.contactMethods.find((m: any) => m.type === 'PHONE' && m.isVisible);
  const emailMethod = profile.contactMethods.find((m: any) => m.type === 'EMAIL' && m.isVisible);

  return (
    <div className="w-full md:max-w-md bg-[#F2F5F9] min-h-screen md:min-h-0 md:rounded-[2.5rem] md:shadow-2xl md:my-4 overflow-hidden flex flex-col relative text-slate-800 font-sans shadow-inner group/layout">
      
      {/* Header Banner Section */}
      <div className="relative h-64 w-full bg-primary overflow-hidden border-b-2" style={{ borderColor: 'var(--secondary)' }}>
        {profile.coverPhotoUrl ? (
          <Image
            src={profile.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <div className="h-20 w-20 border-4 border-white rotate-45 flex items-center justify-center">
                <div className="-rotate-45 font-black text-white text-3xl">S</div>
             </div>
          </div>
        )}
        
        {/* Header Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />

        {/* Share Button in Header */}
        <div className="absolute top-6 right-6 z-20">
          <ShareButton 
            username={profile.username} 
            hasBannerImage={!!profile.coverPhotoUrl} 
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 -mt-32 pb-24">

        {/* Rounded Square Profile Image */}
        <div className="relative mb-6">
          <div className="h-44 w-44 rounded-[2.5rem] bg-white p-2 shadow-2xl transition-transform hover:scale-[1.02] duration-500">
            <Avatar className="h-full w-full rounded-[2rem] bg-slate-100 overflow-hidden border border-slate-100">
              <AvatarImage src={profile.profilePhotoUrl || ""} className="object-cover" />
              <AvatarFallback className="bg-slate-200 text-slate-400 text-4xl font-bold">
                {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center justify-center gap-2">
            {profile.firstName} {profile.lastName}
            <span className="text-slate-400 font-normal text-lg italic">
              {profile.pronouns && `(${profile.pronouns})`}
            </span>
          </h2>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">
              {profile.jobTitle || "Professional"}
            </p>
            <p className="text-xs font-bold text-slate-800/80 tracking-tight">
              {profile.user?.company?.name }
            </p>
          </div>
        </div>

        {/* Social Quick Row */}
        {allLinks.length > 0 && (
          <div className="mt-8 flex flex-col items-center w-full">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Connect with me on</p>
             <div className="flex items-center justify-center gap-6">
               {allLinks.slice(0, 4).map((link: any) => (
                 <a 
                   key={link.id} 
                   href={getUrl(link)} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:scale-110 transition-all active:scale-95 bg-white shadow-sm"
                 >
                   <div className="scale-90">
                     {getIcon(link.type, link.platform)}
                   </div>
                 </a>
               ))}
             </div>
          </div>
        )}

        {/* List Based Contact Section */}
        <div className="w-full mt-10 space-y-3">
          {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
             <a 
               key={method.id} 
               href={getUrl(method)}
               className="flex items-center w-full p-2 bg-transparent group/item"
             >
               <div className="h-12 w-12 shrink-0 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover/item:border-primary/30 group-hover/item:shadow-md transition-all text-primary">
                 <div className="scale-110">
                   {getIcon(method.type)}
                 </div>
               </div>
               <div className="ml-4 flex flex-col min-w-0">
                 <span className="text-sm font-bold text-slate-700 truncate group-hover/item:text-primary transition-colors">
                   {method.value}
                 </span>
                 <span className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider">
                   {method.label || (method.type === 'PHONE' ? 'Personal' : 'Work')}
                 </span>
               </div>
             </a>
          ))}
        </div>
      </div>

      {/* Persistent Bottom Bar */}
      <div className="absolute bottom-0 left-0 w-full p-4 z-30">
        <a href={`/api/vcard/${profile.username}`} className="block">
           <Button className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-t border-white/10 hover:brightness-110">
              <Download className="h-4 w-4" />
              Add to Contacts
           </Button>
        </a>
      </div>
    </div>
  );
}
