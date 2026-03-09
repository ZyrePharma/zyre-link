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
        {profile.coverPhotoUrl && (
          <Image
            src={profile.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover opacity-60"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
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

        <div className="mt-8 grid grid-cols-2 gap-3 pb-8 border-b border-slate-100">
          <a href={`tel:${profile.contactMethods.find((m: any) => m.type === 'PHONE')?.value || '#'}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all group">
            <Phone className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mobile</span>
              <span className="text-xs font-bold truncate">Call Now</span>
            </div>
          </a>
          <a href={`mailto:${profile.contactMethods.find((m: any) => m.type === 'EMAIL')?.value || '#'}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all group">
            <Mail className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</span>
              <span className="text-xs font-bold truncate">Get in touch</span>
            </div>
          </a>
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Professional Bio</h3>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "{profile.bio || "Dedicated professional committed to excellence and strategic growth."}"
            </p>
          </section>

          <section className="space-y-3 pb-12">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {allLinks.map((item: any) => (
                <a
                  key={item.id}
                  href={getUrl(item)}
                  className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-all group border-l-2 border-transparent hover:border-primary"
                >
                  <div className="mr-4 text-slate-400 group-hover:text-primary transition-colors">
                    {getIcon(item.type, item.platform)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 flex-1">{item.title || item.label || item.platform}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 left-0 w-full p-6 pt-0 mt-auto bg-white/80 backdrop-blur-md">
          <a href={`/api/vcard/${profile.username}`}>
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-semibold shadow-lg">
              <Download className="h-4 w-4 mr-2" />
              Add to Phonebook
            </Button>
          </a>
          <p className="text-[8px] text-center mt-4 text-slate-300 font-black uppercase tracking-[0.5em]">ZYRE LINK</p>
        </div>
      </div>
    </div>
  );
}
