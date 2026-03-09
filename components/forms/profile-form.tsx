"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Image as ImageIcon, 
  X, 
  Users, 
  MapPin, 
  Hash, 
  Plus,
  Trash2,
  Camera,
  Upload,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { ContactType } from "@prisma/client";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().optional(),
  bio: z.string().max(300, "Bio must be less than 300 characters").optional(),
  officeLocation: z.string().optional(),
  teamName: z.string().optional(),
  extension: z.string().optional(),
  profilePhotoUrl: z.string().optional().nullable(),
  coverPhotoUrl: z.string().optional().nullable(),
  contactMethods: z.array(z.object({
    id: z.string().optional(),
    type: z.nativeEnum(ContactType),
    label: z.string().min(1, "Label is required"),
    value: z.string().min(1, "Value is required"),
    isPrimary: z.boolean().default(false),
  })).default([]),
  socialLinks: z.array(z.object({
    id: z.string().optional(),
    platform: z.string().min(1, "Platform is required"),
    url: z.string().url("Must be a valid URL"),
  })).default([]),
  customLinks: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Must be a valid URL"),
    description: z.string().optional().nullable(),
  })).default([]),
  autoDownloadVcf: z.boolean().default(false),
  layout: z.string().default("classic"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  userId?: string; // Optional userId for admin editing another user
  initialData?: any; // The initial data from prisma `user.profile`
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      username: initialData?.username ?? "",
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      jobTitle: initialData?.jobTitle ?? "",
      department: initialData?.department ?? "",
      bio: initialData?.bio ?? "",
      officeLocation: initialData?.officeLocation ?? "",
      teamName: initialData?.teamName ?? "",
      extension: initialData?.extension ?? "",
      profilePhotoUrl: initialData?.profilePhotoUrl ?? "",
      coverPhotoUrl: initialData?.coverPhotoUrl ?? "",
      contactMethods: initialData?.contactMethods ?? [],
      socialLinks: initialData?.socialLinks ?? [],
      customLinks: initialData?.customLinks ?? [],
      autoDownloadVcf: initialData?.autoDownloadVcf ?? false,
      layout: initialData?.layout ?? "classic",
    },
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contactMethods",
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const { fields: customFields, append: appendCustom, remove: removeCustom } = useFieldArray({
    control: form.control,
    name: "customLinks",
  });

  // Upload file to Cloudinary via API route
  const handleFileUpload = async (
    file: File,
    folder: string,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUrl(data.url);
      toast.success("Photo uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const endpoint = userId ? `/api/admin/users/${userId}/profile` : "/api/profile";
      const method = userId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border border-primary/20 bg-card text-card-foreground overflow-hidden light">
      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          {/* Visual Preview Header */}
          <div className="relative">
            {/* Cover Photo */}
            <div 
              className="h-52 md:h-64 relative cursor-pointer group"
              onClick={() => coverInputRef.current?.click()}
              style={{ backgroundImage: `url(${form.watch("coverPhotoUrl") || "/zyre-banner.jpg"})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {uploadingCover ? (
                  <Loader2 className="text-white w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="text-white w-5 h-5" />
                    <span className="text-white text-xs font-medium">Change Cover</span>
                  </>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "zyre_link/covers", (url) => form.setValue("coverPhotoUrl", url), setUploadingCover);
                  e.target.value = "";
                }}
              />

              {/* Red accent stripe */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div
                className="relative cursor-pointer group/avatar"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Avatar className="h-28 w-28 border-4 border-background shadow-xl bg-background ring-2 ring-secondary/20">
                  <AvatarImage src={form.watch("profilePhotoUrl") || ""} />
                  <AvatarFallback className="text-2xl bg-background text-primary border border-primary/10">
                    {form.watch("firstName")?.[0]}{form.watch("lastName")?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ? (
                    <Loader2 className="text-white w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="text-white w-5 h-5" />
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "zyre_link/profiles", (url) => form.setValue("profilePhotoUrl", url), setUploadingAvatar);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <CardContent className="pt-20 pb-8 px-4 md:px-6 space-y-8">
            {/* Centered Top Identity Section */}
            <div className="text-center space-y-4 max-w-sm mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control as any}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="First Name" className="text-center font-bold text-lg h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Last Name" className="text-center font-bold text-lg h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Job Title" className="text-center text-primary font-medium border-none shadow-none focus-visible:ring-1 h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Department" className="text-center text-sm text-muted-foreground border-none shadow-none focus-visible:ring-1 h-6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Main Form Fields */}
            <div className="space-y-6 pt-4">
              <FormField
                control={form.control as any}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Profile Link</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2 bg-background rounded-lg px-3 border border-border focus-within:ring-1 ring-primary/30">
                        <span className="text-muted-foreground text-sm py-2">
                          {mounted ? window.location.host : ""}/profile/
                        </span>
                        <Input {...field} className="border-none shadow-none focus-visible:ring-0 p-0 h-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">About You</FormLabel>
                    <FormControl>
                      <textarea 
                        {...field} 
                        placeholder="Share a bit about yourself..."
                        className="w-full min-h-[100px] rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 ring-primary/30 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Profile Layout</h3>
                <FormField
                  control={form.control as any}
                  name="layout"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'classic', label: 'Classic' },
                            { id: 'modern', label: 'Modern' },
                            { id: 'executive', label: 'Exec' },
                            { id: 'social', label: 'Social' },
                            { id: 'card', label: 'Card' },
                          ].map((layout) => (
                            <button
                              key={layout.id}
                              type="button"
                              onClick={() => field.onChange(layout.id)}
                              className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all group/layout",
                                field.value === layout.id 
                                  ? "border-primary bg-primary/5 text-primary scale-[1.02] shadow-sm" 
                                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                              )}
                            >
                              <div className={cn(
                                "w-full aspect-[4/5] rounded-lg mb-2 border border-border/50 overflow-hidden relative shadow-inner bg-white",
                              )}>
                                {/* CSS Previews */}
                                {layout.id === 'classic' && (
                                  <div className="w-full h-full flex flex-col items-center p-1 pt-3 scale-[0.8]">
                                    <div className="w-full h-8 bg-gray-100 rounded-t-sm mb-2" />
                                    <div className="w-8 h-8 rounded-full bg-primary border-2 border-white -mt-5 shadow-sm" />
                                    <div className="w-12 h-1 bg-gray-300 rounded-full mt-2" />
                                    <div className="w-8 h-1 bg-gray-200 rounded-full mt-1" />
                                    <div className="mt-2 space-y-1 w-full px-2">
                                      <div className="w-full h-3 bg-gray-100 rounded-sm" />
                                      <div className="w-full h-3 bg-gray-100 rounded-sm" />
                                    </div>
                                  </div>
                                )}
                                {layout.id === 'modern' && (
                                  <div className="w-full h-full flex flex-col items-center p-1 pt-6 scale-[0.8] bg-gray-50/50">
                                    <div className="absolute top-0 w-full h-8 bg-primary/5" />
                                    <div className="w-10 h-10 rounded-full bg-primary ring-2 ring-white shadow-md z-10" />
                                    <div className="w-14 h-1.5 bg-gray-900 rounded-full mt-3 z-10" />
                                    <div className="mt-4 space-y-2 w-full px-2">
                                      <div className="w-full h-4 bg-white border border-gray-100 rounded-xl shadow-xs" />
                                      <div className="w-full h-4 bg-white border border-gray-100 rounded-xl shadow-xs" />
                                    </div>
                                  </div>
                                )}
                                {layout.id === 'executive' && (
                                  <div className="w-full h-full flex flex-col p-1 pt-3 scale-[0.8]">
                                    <div className="w-full h-8 bg-slate-900 rounded-t-sm mb-2" />
                                    <div className="px-2 -mt-6">
                                      <div className="w-8 h-8 rounded-lg bg-white border-2 border-slate-200 shadow-sm" />
                                    </div>
                                    <div className="mt-2 px-2 space-y-1">
                                      <div className="w-14 h-2 bg-slate-800 rounded-sm" />
                                      <div className="w-10 h-1 bg-primary rounded-full" />
                                      <div className="w-full h-1 bg-slate-100 rounded-full mt-2" />
                                      <div className="w-[80%] h-1 bg-slate-100 rounded-full" />
                                    </div>
                                    <div className="mt-3 px-2 flex gap-1">
                                      <div className="w-full h-4 bg-slate-50 rounded-md border border-slate-100" />
                                      <div className="w-full h-4 bg-slate-50 rounded-md border border-slate-100" />
                                    </div>
                                  </div>
                                )}
                                {layout.id === 'social' && (
                                  <div className="w-full h-full flex flex-col items-center p-1 pt-4 scale-[0.8] bg-slate-900">
                                    <div className="absolute inset-0 bg-primary/10 opacity-50" />
                                    <div className="w-10 h-10 rounded-full border-2 border-primary/50 p-0.5 z-10">
                                      <div className="w-full h-full rounded-full bg-slate-800" />
                                    </div>
                                    <div className="w-12 h-1.5 bg-white rounded-full mt-3 z-10" />
                                    <div className="mt-4 space-y-2 w-full px-2 z-10">
                                      <div className="w-full h-5 bg-white/10 rounded-3xl border border-white/10" />
                                      <div className="w-full h-5 bg-white/10 rounded-3xl border border-white/10" />
                                      <div className="w-full h-5 bg-white/10 rounded-3xl border border-white/10" />
                                    </div>
                                  </div>
                                )}
                                {layout.id === 'card' && (
                                  <div className="w-full h-full flex flex-col p-2 scale-[0.8] bg-neutral-100">
                                    <div className="w-full h-24 bg-white rounded-xl shadow-sm border border-white flex flex-col items-center pt-2">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 mx-auto" />
                                      <div className="w-10 h-1 bg-gray-900 rounded-full mt-2" />
                                      <div className="flex gap-1 mt-2">
                                        <div className="w-3 h-3 rounded-md bg-gray-900" />
                                        <div className="w-3 h-3 rounded-md bg-gray-900" />
                                        <div className="w-3 h-3 rounded-md bg-gray-900" />
                                      </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      <div className="h-8 bg-white rounded-lg shadow-xs" />
                                      <div className="h-8 bg-white rounded-lg shadow-xs" />
                                    </div>
                                  </div>
                                )}

                                {field.value === layout.id && (
                                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-20">
                                    <div className="bg-primary text-white p-1 rounded-full shadow-lg">
                                      <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest">{layout.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Company Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control as any}
                    name="teamName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center p-3 rounded-xl bg-background border border-border focus-within:ring-1 ring-primary/30">
                            <Users className="h-4 w-4 text-primary mr-3 shrink-0" />
                            <Input {...field} placeholder="Team Name" className="border-none shadow-none focus-visible:ring-0 p-0 h-5 text-sm font-medium" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="officeLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center p-3 rounded-xl bg-background border border-border focus-within:ring-1 ring-primary/30">
                            <MapPin className="h-4 w-4 text-primary mr-3 shrink-0" />
                            <Input {...field} placeholder="Office Location" className="border-none shadow-none focus-visible:ring-0 p-0 h-5 text-sm font-medium" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="extension"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center p-3 rounded-xl bg-background border border-border focus-within:ring-1 ring-primary/30">
                            <Hash className="h-4 w-4 text-primary mr-3 shrink-0" />
                            <Input {...field} placeholder="Internal Extension" className="border-none shadow-none focus-visible:ring-0 p-0 h-5 text-sm font-medium" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Dynamic Sections: Contacts, Socials, Links */}
              <div className="space-y-8 pt-4">
                {/* Contact Methods */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Methods</h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => appendContact({ type: ContactType.PHONE, label: "", value: "", isPrimary: false })}
                      className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Contact
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {contactFields.map((field, index) => (
                      <div key={field.id} className="group relative flex items-start gap-3 p-3 rounded-xl bg-background border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1">
                          <FormField
                            control={form.control as any}
                            name={`contactMethods.${index}.type`}
                            render={({ field }) => (
                              <div className="sm:col-span-3">
                                <select 
                                  {...field}
                                  className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs focus:ring-1 ring-primary/20 outline-none"
                                >
                                  {Object.values(ContactType).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          />
                          <FormField
                            control={form.control as any}
                            name={`contactMethods.${index}.label`}
                            render={({ field }) => (
                              <div className="sm:col-span-3">
                                <Input {...field} placeholder="Label (e.g. Work)" className="h-9 text-xs border-none shadow-none bg-background focus-visible:ring-1" />
                              </div>
                            )}
                          />
                          <FormField
                            control={form.control as any}
                            name={`contactMethods.${index}.value`}
                            render={({ field }) => (
                              <div className="sm:col-span-6">
                                <Input {...field} placeholder="Value" className="h-9 text-xs border-none shadow-none bg-background focus-visible:ring-1" />
                              </div>
                            )}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeContact(index)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {contactFields.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-4 border border-dashed rounded-xl border-primary/10">No contact methods added yet.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="autoDownloadVcf"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-4 shadow-sm bg-background">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-semibold">Auto-download Contact</FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Automatically prompt visitors to download your .vcf file when they visit your profile.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social Links</h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => appendSocial({ platform: "linkedin", url: "" })}
                      className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Social
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {socialFields.map((field, index) => (
                      <div key={field.id} className="group relative flex items-start gap-3 p-3 rounded-xl bg-background border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1">
                          <FormField
                            control={form.control as any}
                            name={`socialLinks.${index}.platform`}
                            render={({ field }) => (
                              <div className="sm:col-span-4">
                                <select 
                                  {...field}
                                  className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs focus:ring-1 ring-primary/20 outline-none"
                                >
                                  <option value="linkedin">LinkedIn</option>
                                  <option value="github">GitHub</option>
                                  <option value="twitter">Twitter</option>
                                  <option value="facebook">Facebook</option>
                                  <option value="instagram">Instagram</option>
                                  <option value="website">Website</option>
                                </select>
                              </div>
                            )}
                          />
                          <FormField
                            control={form.control as any}
                            name={`socialLinks.${index}.url`}
                            render={({ field }) => (
                              <div className="sm:col-span-8">
                                <Input {...field} placeholder="URL" className="h-9 text-xs border-none shadow-none bg-background focus-visible:ring-1" />
                              </div>
                            )}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeSocial(index)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {socialFields.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-4 border border-dashed rounded-xl border-primary/10">No social links added yet.</p>
                    )}
                  </div>
                </div>

                {/* Custom Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Buttons</h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => appendCustom({ title: "", url: "", description: "" })}
                      className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Button
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {customFields.map((field, index) => (
                      <div key={field.id} className="group relative space-y-3 p-3 rounded-xl bg-background border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <FormField
                              control={form.control as any}
                              name={`customLinks.${index}.title`}
                              render={({ field }) => (
                                <Input {...field} placeholder="Button Text" className="h-9 text-xs border-none shadow-none bg-background focus-visible:ring-1 font-bold" />
                              )}
                            />
                            <FormField
                              control={form.control as any}
                              name={`customLinks.${index}.url`}
                              render={({ field }) => (
                                <Input {...field} placeholder="URL" className="h-9 text-xs border-none shadow-none bg-background focus-visible:ring-1" />
                              )}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeCustom(index)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormField
                          control={form.control as any}
                          name={`customLinks.${index}.description`}
                          render={({ field }) => (
                            <Input {...field} placeholder="Optional description..." className="h-7 text-[10px] border-none shadow-none bg-background/50 focus-visible:ring-1" />
                          )}
                        />
                      </div>
                    ))}
                    {customFields.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-4 border border-dashed rounded-xl border-primary/10">No custom buttons added yet.</p>
                    )}
                  </div>
                </div>
              </div>

              
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="flex-1 rounded-full border-primary/20 hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
          
          <div className="bg-background border-t border-border p-4 text-center">
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Editing Professional Profile</p>
          </div>
        </form>
      </Form>
    </Card>
  );
}
