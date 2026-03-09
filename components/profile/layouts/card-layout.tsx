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
      <div className="bg-white rounded-[2rem] shadow-xl border border-white flex flex-col items-center relative overflow-hidden group">
        <div className="w-full h-32 bg-neutral-100 relative overflow-hidden">
          {profile.coverPhotoUrl ? (
            <Image
              src={profile.coverPhotoUrl}
              alt="Cover"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
          ) : (
             <div className="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-br-[4rem]" />
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

        <div className="mt-6 text-center z-10">
          <h2 className="text-2xl font-black tracking-tight">{profile.firstName} {profile.lastName}</h2>
          <p className="text-primary font-bold text-[10px] uppercase tracking-widest mt-1 bg-primary/5 px-3 py-1 rounded-full">{profile.jobTitle || "Professional"}</p>
        </div>

        <div className="w-full flex gap-3 mt-8">
            <a href={`tel:${profile.contactMethods.find((m: any) => m.type === 'PHONE')?.value || '#'}`} className="flex-1 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95">
                <Phone className="h-5 w-5 text-white" />
            </a>
            <a href={`mailto:${profile.contactMethods.find((m: any) => m.type === 'EMAIL')?.value || '#'}`} className="flex-1 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95">
                <Mail className="h-5 w-5 text-white" />
            </a>
            <a href={`sms:${profile.contactMethods.find((m: any) => m.type === 'PHONE')?.value || '#'}`} className="flex-1 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95">
                <MessageSquare className="h-5 w-5 text-white" />
            </a>
        </div>
        </div>
      </div>

      <a href={`/api/vcard/${profile.username}`} className="block">
        <div className="bg-primary rounded-3xl p-6 shadow-lg flex items-center justify-between group cursor-pointer hover:bg-primary/95 transition-all active:scale-[0.98]">
          <div className="flex flex-col">
              <h3 className="text-primary-foreground font-black text-lg">Save Contact</h3>
              <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-wider">Fast & Easy</p>
          </div>
          <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
              <Download className="h-6 w-6" />
          </div>
        </div>
      </a>

      {/* Links Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {allLinks.map((item: any) => (
            <a 
                key={item.id}
                href={getUrl(item)}
                className="bg-white rounded-3xl p-6 shadow-md border border-white hover:border-primary/20 transition-all flex flex-col items-center text-center gap-3 active:scale-95"
            >
                <div className="h-10 w-10 flex items-center justify-center text-primary bg-primary/5 rounded-xl">
                    {getIcon(item.type, item.platform)}
                </div>
                <span className="text-xs font-black uppercase tracking-tight truncate w-full">{item.platform || item.title}</span>
                <ArrowUpRight className="h-3 w-3 text-neutral-300 absolute top-4 right-4" />
            </a>
        ))}
      </div>

      <div className="mt-auto py-6 text-center">
        <p className="text-[10px] font-black text-neutral-300 tracking-[1em] uppercase">ZYRE LINK</p>
      </div>
    </div>
  );
}
