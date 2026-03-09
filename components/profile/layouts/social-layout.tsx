import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Download, ChevronRight, Share2, Instagram, Twitter, Linkedin, Github, Facebook, Youtube } from "lucide-react";
import Image from "next/image";

export function SocialLayout({ profile, allLinks, getIcon, getUrl }: any) {
  return (
    <div className="w-full md:max-w-md bg-[#0f172a] min-h-screen md:min-h-0 md:rounded-[3rem] md:shadow-2xl md:my-4 overflow-hidden flex flex-col relative text-white">
      
      {/* Header Banner */}
      <div className="relative h-56 w-full overflow-hidden">
        {profile.coverPhotoUrl ? (
          <Image
            src={profile.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0f172a] to-[#0f172a] opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
        
        <div className="absolute top-6 right-6 z-20">
          <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10">
            <Share2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="relative z-10 px-8 flex flex-col items-center -mt-20 pb-12">

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <Avatar className="h-36 w-36 border-2 border-white/20 relative rounded-full">
            <AvatarImage src={profile.profilePhotoUrl || ""} />
            <AvatarFallback className="bg-slate-800 text-white text-3xl font-bold">
              {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="mt-2 text-slate-400 font-medium">{profile.bio || "Sharing my journey and connecting with you! ✨"}</p>
        </div>

        <div className="w-full mt-10 grid grid-cols-1 gap-4">
           {allLinks.map((item: any) => (
              <a
                key={item.id}
                href={getUrl(item)}
                className="group flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all hover:-translate-y-1 active:scale-95"
              >
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  {getIcon(item.type, item.platform)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white tracking-wide uppercase text-xs">{item.platform || item.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Click to visit</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white" />
              </a>
           ))}
        </div>

        <div className="w-full mt-12 mb-8">
           <a href={`/api/vcard/${profile.username}`}>
             <Button className="w-full h-16 bg-white text-primary hover:bg-slate-100 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
                <Download className="h-5 w-5" />
                Get My Contact
             </Button>
           </a>
        </div>

        <div className="flex gap-4 mt-4 text-slate-600">
          <Phone className="h-4 w-4" />
          <Mail className="h-4 w-4" />
          <MessageSquare className="h-4 w-4" />
        </div>

        <div className="mt-12 opacity-30">
          <p className="text-[10px] font-black tracking-[0.5em]">ZYRE LINK</p>
        </div>
      </div>
    </div>
  );
}
