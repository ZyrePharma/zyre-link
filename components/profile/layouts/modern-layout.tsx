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
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-white" />
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
          {profile.bio || "Connecting professionals through Zyre Link."}
        </p>

        <div className="grid grid-cols-3 gap-8 mt-10 w-full px-4">
          <a href={`tel:${profile.contactMethods.find((m: any) => m.type === 'PHONE')?.value || '#'}`} className="flex flex-col items-center gap-2 group">
            <div className="h-14 w-14 rounded-2xl bg-secondary/50 flex items-center justify-center border border-secondary transition-all group-hover:bg-secondary group-hover:-translate-y-1">
              <Phone className="h-6 w-6 text-secondary-foreground" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Call</span>
          </a>
          <a href={`sms:${profile.contactMethods.find((m: any) => m.type === 'PHONE')?.value || '#'}`} className="flex flex-col items-center gap-2 group">
            <div className="h-14 w-14 rounded-2xl bg-secondary/50 flex items-center justify-center border border-secondary transition-all group-hover:bg-secondary group-hover:-translate-y-1">
              <MessageSquare className="h-6 w-6 text-secondary-foreground" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SMS</span>
          </a>
          <a href={`mailto:${profile.contactMethods.find((m: any) => m.type === 'EMAIL')?.value || '#'}`} className="flex flex-col items-center gap-2 group">
            <div className="h-14 w-14 rounded-2xl bg-secondary/50 flex items-center justify-center border border-secondary transition-all group-hover:bg-secondary group-hover:-translate-y-1">
              <Mail className="h-6 w-6 text-secondary-foreground" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</span>
          </a>
        </div>

        <div className="w-full mt-10 space-y-3">
          <Button className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl h-14 font-bold text-base shadow-xl transition-all active:scale-[0.98]">
            <Download className="h-5 w-5 mr-2" />
            Save Contact
          </Button>
        </div>

        <div className="w-full mt-12 mb-8">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 px-2">Featured Links</h3>
          <div className="grid grid-cols-1 gap-4">
            {allLinks.map((item: any) => (
              <a
                key={item.id}
                href={getUrl(item)}
                className="flex items-center p-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center mr-4 shrink-0 group-hover:bg-primary/5">
                  {getIcon(item.type, item.platform)}
                </div>
                <p className="flex-1 font-bold text-gray-700">
                  {item.title || item.label || item.platform}
                </p>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-all" />
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
