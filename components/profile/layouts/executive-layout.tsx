import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Download, ChevronRight, Globe, Linkedin, MapPin, Building2, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/profile/share-button";

export function ExecutiveLayout({ profile, allLinks, getIcon, getUrl }: any) {
  return (
    <div className="w-full md:max-w-md bg-white min-h-screen md:min-h-0 md:rounded-3xl md:shadow-2xl md:my-4 overflow-hidden flex flex-col relative text-slate-900 border border-slate-100">
      
      {/* Header Banner */}
      <div className="h-40 bg-slate-900 relative overflow-hidden">
        {profile.coverPhotoUrl ? (
          <Image
            src={profile.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover opacity-60"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-white border-b border-slate-100 flex items-center justify-center">
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
              <h1 className="text-slate-900 text-3xl font-black tracking-widest opacity-90 select-none">
                {profile.user.company?.name?.toUpperCase() || "ZYRE"}
              </h1>
            )}
          </div>
        )}
        <div className="absolute top-6 right-6">
          <ShareButton 
            username={profile.username} 
            hasBannerImage={!!profile.coverPhotoUrl} 
          />
        </div>
      </div>

      <div className="px-8 -mt-16 relative z-10">
        <Avatar className="h-32 w-32 border-[6px] border-white shadow-lg bg-slate-100 rounded-2xl">
          <AvatarImage src={profile.profilePhotoUrl || ""} />
          <AvatarFallback className="bg-slate-200 text-slate-600 text-3xl font-medium rounded-2xl">
            {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
          </AvatarFallback>
        </Avatar>

        <div className="mt-6 flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {profile.firstName} {profile.lastName}
          </h2>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <UserCircle2 className="h-4 w-4" />
            <span>{profile.jobTitle || "Executive"}</span>
          </div>
          {profile.department && (
            <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
              <Building2 className="h-4 w-4" />
              <span>{profile.department}</span>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-6 justify-center pb-8 border-b border-slate-100 px-4">
          {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
            <a 
              key={method.id}
              href={getUrl(method)} 
              target={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "_blank" : undefined}
              rel={method.type === 'WHATSAPP' || method.type === 'VIBER' ? "noopener noreferrer" : undefined}
              className="flex flex-col items-center gap-2 transition-all active:scale-95"
              title={method.label || method.type}
            >
              <div className="h-14 w-14 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-primary shadow-md">
                <div className="scale-110">
                  {getIcon(method.type)}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none text-center">
                {method.type === 'PHONE' ? 'Call' : (method.type === 'EMAIL' ? 'Email' : method.label || method.type)}
              </span>
            </a>
          ))}
          {/* Always add SMS for PHONES if any */}
          {profile.contactMethods.filter((m: any) => m.isVisible && m.type === 'PHONE').slice(0, 1).map((method: any) => (
            <a 
              key={`sms-${method.id}`}
              href={`sms:${method.value}`} 
              className="flex flex-col items-center gap-2 transition-all active:scale-95"
              title="SMS"
            >
              <div className="h-14 w-14 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-primary shadow-md">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none text-center">SMS</span>
            </a>
          ))}
        </div>

        {/* Explicit Contact Info */}
        <div className="mt-6 flex flex-col gap-2">
          {profile.contactMethods.filter((m: any) => m.isVisible).map((method: any) => (
            <div key={method.id} className="flex items-center gap-3 text-slate-600">
              <div className="h-4 w-4 flex items-center justify-center scale-75 opacity-60">
                {getIcon(method.type)}
              </div>
              <span className="text-sm font-medium">{method.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Professional Bio</h3>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "{profile.bio || `I'm ${profile.firstName}! Connecting with me is just a tap away.`}"
            </p>
          </section>

          <section className="space-y-3 pb-12">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {allLinks.map((item: any) => (
                <a
                  key={item.id}
                  href={getUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg transition-all border-l-2 border-transparent active:border-primary active:bg-slate-50"
                >
                  <div className="mr-4 text-slate-400 transition-colors">
                    {getIcon(item.type, item.platform)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 flex-1">{item.title || item.label || item.platform}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 left-0 w-full p-6 pt-0 mt-auto bg-white/80 backdrop-blur-md">
          <a href={`/api/vcard/${profile.username}`}>
            <Button className="w-full bg-slate-900 text-white rounded-2xl h-16 font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
              <Download className="h-5 w-5" />
              Add to Phonebook
            </Button>
          </a>
          <p className="text-[8px] text-center mt-4 text-slate-300 font-black uppercase tracking-[0.5em]">ZYRE LINK</p>
        </div>
      </div>
    </div>
  );
}
