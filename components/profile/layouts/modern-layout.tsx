import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Globe, Instagram, Linkedin, Twitter, Download, MessageSquare, ChevronRight } from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/profile/share-button";
import { ProfileQRCode } from "@/components/profile/profile-qr-code";

export function ModernLayout({ profile, allLinks, getIcon, getUrl }: any) {
  const primaryColor = "var(--primary)";
  const secondaryColor = "var(--secondary)";

  return (
    <div className="w-full md:max-w-md bg-[#FDFCFB] min-h-screen md:min-h-0 md:rounded-[3rem] md:shadow-2xl md:my-4 overflow-hidden flex flex-col relative text-slate-800 font-sans border-8 border-white shadow-[0_0_40px_rgba(0,0,0,0.05)]">
      
      {/* Background Subtle Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />

      {/* Header Image with Arch Profile Photo */}
      <div className="relative h-64 w-full bg-slate-100 overflow-hidden border-b-2" style={{ borderColor: secondaryColor }}>
        {profile.coverPhotoUrl ? (
          <Image
            src={profile.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
             <span className="text-slate-400 text-xs font-bold tracking-[0.3em] uppercase opacity-50">Luxury Interior</span>
          </div>
        )}
        <div className="absolute top-6 right-6 z-20">
          <ShareButton 
            username={profile.username} 
            hasBannerImage={!!profile.coverPhotoUrl} 
          />
        </div>
      </div>

      <div className="relative z-10 px-6 flex flex-col items-center -mt-12 pb-12">
        
        {/* Rounded Square Profile Section */}
        <div className="relative mb-8">
          <div 
            className="w-48 h-48 bg-white p-1.5 shadow-2xl relative overflow-hidden" 
            style={{ 
              borderRadius: "2.5rem",
              boxShadow: `0 25px 50px -12px ${secondaryColor}`
            }}
          >
            <div 
              className="w-full h-full overflow-hidden bg-slate-100"
              style={{ borderRadius: "2rem" }}
            >
              {profile.profilePhotoUrl ? (
                <Image 
                  src={profile.profilePhotoUrl} 
                  alt={profile.firstName} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <AvatarFallback className="text-4xl text-slate-400">
                    {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
                  </AvatarFallback>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identity Section */}
        <div className="text-center space-y-2 mb-4 w-full">
          <h2 className="text-3xl font-serif font-medium tracking-tight text-slate-800 italic" style={{ fontFamily: "serif" }}>
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-sm font-medium tracking-[0.2em] uppercase opacity-70" style={{ color: primaryColor }}>
            {profile.jobTitle }
          </p>
          <div className="w-12 h-[1px] mx-auto opacity-30 mt-4" style={{ backgroundColor: primaryColor }} />
        </div>

          {/* Always add Address if exists for that luxury vibes */}
          <p className="text-[11px] text-center text-slate-400  leading-relaxed italic px-8 mb-4">
            {profile.bio || `I'm ${profile.firstName}! Connecting with me is just a tap away.`}
          </p>

        {/* Contact Capsules Section */}
        <div className="w-full space-y-2.5 px-6">
          {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
             <a 
               key={method.id} 
               href={getUrl(method)}
               className="flex items-center w-full p-1.5 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
             >
               <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-colors mr-3 bg-[#FDFCFB] border border-slate-50 shadow-inner hover:bg-primary/5" style={{ color: primaryColor }}>
                 <div className="scale-75">
                   {getIcon(method.type)}
                 </div>
               </div>
               <span className="text-xs font-semibold text-slate-600 truncate flex-1 tracking-tight">
                 {method.value}
               </span>
               <ChevronRight className="h-4 w-4 mr-2 text-slate-300 group-hover:text-primary transition-colors" />
             </a>
          ))}
        </div>

        {/* QR Code Section */}
        <div className="mt-12 flex flex-col items-center">
           
           <div className="mt-8 flex items-center justify-center gap-8 w-full">
             {allLinks.slice(0, 5).map((item: any) => (
               <a 
                 key={item.id} 
                 href={getUrl(item)} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="hover:scale-125 active:scale-95 transition-transform duration-300"
                 style={{ color: secondaryColor }}
               >
                 <div className="scale-[1.75]">
                   {getIcon(item.type, item.platform)}
                 </div>
               </a>
             ))}
           </div>
        </div>

        {/* Footer Area */}
        <div className="w-full mt-12 mb-6 px-4">
          <a href={`/api/vcard/${profile.username}`}>
            <Button 
              className="w-full h-14 rounded-full text-white font-bold text-xs uppercase tracking-[.25em] shadow-xl transition-all active:scale-95 bg-primary hover:bg-primary/90 shadow-primary/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Add to Contacts
            </Button>
          </a>
        </div>

        <div className="opacity-20 flex flex-col items-center">
          <p className="text-[10px] font-black tracking-[0.5em] text-slate-800 mb-1">ZYRE LINK</p>
          <div className="w-8 h-[1px]" style={{ backgroundColor: secondaryColor }} />
        </div>
      </div>
    </div>
  );
}
