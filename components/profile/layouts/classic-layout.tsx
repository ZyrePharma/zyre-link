import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Download, ChevronRight } from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/profile/share-button";

export function ClassicLayout({ profile, allLinks, getIcon, getUrl }: any) {
  return (
    <div className="w-full md:max-w-md bg-white min-h-screen md:min-h-0 md:rounded-[2.5rem] md:shadow-2xl md:my-4 overflow-hidden flex flex-col relative text-gray-900">
      {profile.coverPhotoUrl && (
        <Image 
          src={profile.coverPhotoUrl} 
          alt="Background" 
          fill 
          className="object-cover absolute inset-0 z-0 pointer-events-none"
          priority
        />
      )}
      {profile.coverPhotoUrl && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-0" />}

      {/* Cover Section */}
      <div className={cn(
        "h-80 flex items-center justify-center relative overflow-hidden z-10",
        !profile.coverPhotoUrl && "bg-white border-b-2 border-primary"
      )}>
        {!profile.coverPhotoUrl && (
          <>
            {profile.user.company?.logoUrl ? (
              <div className="relative h-32 w-96 px-4">
                <Image 
                  src={profile.user.company.logoUrl} 
                  alt={profile.user.company.name || "Company Logo"} 
                  fill 
                  className="object-contain filter drop-shadow-xl"
                  priority
                />
              </div>
            ) : (
              <h1 className="text-primary text-5xl font-black tracking-widest opacity-90 select-none">
                {profile.user.company?.name?.toUpperCase() || "ZYRE"}
              </h1>
            )}
          </>
        )}
        
        <ShareButton 
          username={profile.username} 
          hasBannerImage={!!profile.coverPhotoUrl} 
        />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Profile Photo Wrapper */}
        <div className="flex flex-col items-center -mt-20 px-6">
          <div className="relative">
            <Avatar className="h-40 w-40 border-4 border-white shadow-xl bg-primary">
              <AvatarImage src={profile.profilePhotoUrl || ""} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold flex items-center justify-center">
                {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Identity */}
          <div className="mt-4 text-center">
            <h2 className="text-xl font-black flex items-center justify-center gap-1.5 ">
              {profile.firstName} {profile.lastName}
            </h2>
            {profile.jobTitle && (
              <p className="text-[12px] font-bold text-primary/70 uppercase tracking-widest -mt-1">
                {profile.jobTitle}
              </p>
            )}
            
            <p className="text-[13px] font-bold text-gray-800 mt-2 px-8 leading-relaxed max-w-sm">
              {profile.bio || `I'm ${profile.firstName}! Connecting with me is just a tap away.`}
            </p>

            {/* Explicit Contact Info */}
            <div className="mt-3 flex flex-col items-center gap-1">
              {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
                <div key={method.id} className="flex items-center gap-1.5 text-[13px] font-bold text-primary/80">
                  <div className="h-3.5 w-3.5 flex items-center justify-center scale-75">
                    {getIcon(method.type)}
                  </div>
                  <span>{method.value}</span>
                </div>
              ))}
            </div>
          </div>
 
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 px-6">
            {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
              <a 
                key={method.id}
                href={getUrl(method)} 
                target={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "_blank" : undefined}
                rel={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "noopener noreferrer" : undefined}
                className="h-14 w-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary shadow-md active:scale-95 active:bg-slate-50 transition-all font-bold"
                title={method.label || method.type}
              >
                <div className="scale-110">
                  {getIcon(method.type)}
                </div>
              </a>
            ))}
          </div>

          <div className="flex w-full gap-2 mt-8">
            <a href={`/api/vcard/${profile.username}`} className="flex-1">
              <Button className="w-full bg-primary text-primary-foreground rounded-2xl h-16 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]">
                <Download className="h-5 w-5" />
                Save to Contacts
              </Button>
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="px-6 mt-8 mb-12 flex flex-col gap-3">
          <div className="flex">
            <span className="px-3 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500 uppercase tracking-wider">Links</span>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {allLinks.map((item: any) => (
              <a
                key={item.id}
                href={getUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3.5 bg-[#f3f4f6]/80 rounded-xl transition-all active:scale-[0.99] border border-transparent shadow-sm"
              >
                <div className="h-10 w-10 flex items-center justify-center mr-3 shrink-0">
                  {getIcon(item.type, item.platform)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-700 truncate capitalize tracking-tight">
                    {item.title || item.label || item.platform || item.type?.toLowerCase().replace('_', ' ') || 'Link'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </a>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="text-center opacity-40">
              <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                Powered by <span className="text-gray-600">ZYRE</span> <span className="text-secondary">LINK</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
