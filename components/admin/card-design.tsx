"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Download, Loader2, Image as ImageIcon, Repeat, LayoutTemplate, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardDesignRenderer } from "@/components/admin/card-design-renderer";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DirectoryUser {
  id: string;
  name: string | null;
  email: string;
  cardUid: string | null;
  profile: {
    username: string | null;
    jobTitle: string | null;
  } | null;
  company: {
    name: string;
    logoUrl: string | null;
    cardTemplateUrl: string | null;
  } | null;
}

export default function CardDesign({
  users,
  templateUrl,
}: {
  users: DirectoryUser[];
  templateUrl: string | null;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [currentTemplateUrl, setCurrentTemplateUrl] = useState<string | null>(templateUrl);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const frontRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const backRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFlip = (id: string, e?: React.MouseEvent) => {
     if (e) e.stopPropagation();
     setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "template");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Upload failed");
      }

      const data = await res.json();
      setCurrentTemplateUrl(data.url);
      toast.success("Template uploaded successfully! Click Save to apply.");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setIsUploadingFile(false);
      // Reset input value so the same file can be picked again if needed
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardTemplateUrl: currentTemplateUrl }),
      });
      
      if (!res.ok) throw new Error("Failed to save template");
      toast.success("Template saved successfully");
      setSettingsOpen(false);
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDownload = async (user: DirectoryUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const frontEl = frontRefs.current[user.id];
    const backEl = backRefs.current[user.id];
    if (!frontEl || !backEl) return;
    
    setDownloadingId(user.id);
    const toastId = toast.loading(`Generating designs for ${user.name}...`);
    
    try {
      // Give DOM time to update with QR code/fonts
      await new Promise(r => setTimeout(r, 800)); 
      
      const [frontDataUrl, backDataUrl] = await Promise.all([
        toPng(frontEl, { cacheBust: true }),
        toPng(backEl, { cacheBust: true })
      ]);
      
      const zip = new JSZip();
      const folderName = user.name?.replace(/\s+/g, '-').toLowerCase() || 'employee';
      
      // Convert DataURLs to Blobs/ArrayBuffers for JSZip
      const frontBlob = await (await fetch(frontDataUrl)).blob();
      const backBlob = await (await fetch(backDataUrl)).blob();
      
      zip.file(`${folderName}-front.png`, frontBlob);
      zip.file(`${folderName}-back.png`, backBlob);
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `card-design-${folderName}.zip`);
      
      toast.success("Designs downloaded successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate designs.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedUsers.size === 0) return;
    
    setIsDownloadingSelected(true);
    const toastId = toast.loading(`Preparing bulk download for ${selectedUsers.size} cards...`);
    
    try {
      const zip = new JSZip();
      const selectedList = users.filter(u => selectedUsers.has(u.id));
      
      for (const user of selectedList) {
        const frontEl = frontRefs.current[user.id];
        const backEl = backRefs.current[user.id];
        if (!frontEl || !backEl) continue;

        // Give DOM time to update/render
        await new Promise(r => setTimeout(r, 100)); 
        
        const [frontDataUrl, backDataUrl] = await Promise.all([
          toPng(frontEl, { cacheBust: true }),
          toPng(backEl, { cacheBust: true })
        ]);

        const folderName = user.name?.replace(/\s+/g, '-').toLowerCase() || `user-${user.id}`;
        
        // Convert DataURLs to Blobs/ArrayBuffers for JSZip
        const frontBlob = await (await fetch(frontDataUrl)).blob();
        const backBlob = await (await fetch(backDataUrl)).blob();
        
        zip.file(`${folderName}-front.png`, frontBlob);
        zip.file(`${folderName}-back.png`, backBlob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `bulk-card-designs.zip`);
      
      toast.success("Bulk download successful", { id: toastId });
      setSelectedUsers(new Set()); // Clear selection after download
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate bulk designs.", { id: toastId });
    } finally {
      setIsDownloadingSelected(false);
    }
  };

  const gridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(300); // Default fallback

  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new ResizeObserver((entries) => {
      // Find the first grid item's width
      const firstCard = entries[0].target.firstElementChild;
      if (firstCard) {
        setContainerWidth(firstCard.clientWidth);
      }
    });
    observer.observe(gridRef.current);
    
    // Initial read
    const firstCard = gridRef.current.firstElementChild;
    if (firstCard) {
       setContainerWidth(firstCard.clientWidth);
    }
    
    return () => observer.disconnect();
  }, [users.length]);

  if (!users.length) {
    return (
      <Card className="border-dashed shadow-none bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No Employees Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            There are no employees with configured profiles to generate cards for yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Employee Directory ({users.length})</h2>
        
        <div className="flex gap-2">
          {selectedUsers.size > 0 && (
            <Button 
               size="sm" 
               variant="default" 
               className="gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg animate-in slide-in-from-right-2 duration-300"
               onClick={handleDownloadSelected}
               disabled={isDownloadingSelected}
            >
               {isDownloadingSelected ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Download className="h-4 w-4" />
               )}
               Download Selected ({selectedUsers.size})
            </Button>
          )}

          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <LayoutTemplate className="h-4 w-4" />
                Set Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl border-primary/20 shadow-2xl">
              <DialogHeader>
                <DialogTitle>Card Design Template</DialogTitle>
                <DialogDescription>
                  Upload a background template used for generating card designs.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                 {/* Preview */}
                 <div className="space-y-2">
                    <Label>Current Template Preview</Label>
                    {currentTemplateUrl ? (
                      <div className="relative w-full aspect-[1.6] rounded-xl overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={currentTemplateUrl} 
                          alt="Template Preview"  
                          className="object-fill w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[1.6] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/30">
                        <ImageIcon className="h-8 w-8 opacity-50" />
                        <span className="text-sm text-center">No template uploaded.<br/>Logo and QR will show on white.</span>
                      </div>
                    )}
                 </div>

                 {/* Upload */}
                 <div className="flex flex-col gap-3">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isUploadingFile}
                      className="gap-2 w-full rounded-xl h-11"
                    >
                      {isUploadingFile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {currentTemplateUrl ? "Change Image" : "Upload Image"}
                    </Button>
                    
                    <div className="space-y-2">
                      <Label>Or Image URL</Label>
                      <Input 
                         value={currentTemplateUrl || ""}
                         onChange={(e) => setCurrentTemplateUrl(e.target.value)}
                         placeholder="https://..."
                         className="rounded-xl"
                      />
                    </div>
                 </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setSettingsOpen(false)}>Cancel</Button>
                <Button className="flex-1 rounded-xl h-11 font-bold" onClick={handleSaveTemplate} disabled={isSavingTemplate}>
                   {isSavingTemplate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                   Save Design
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {users.map((user) => {
          const isFlipped = flippedCards[user.id] || false;
          const isSelected = selectedUsers.has(user.id);
          
          // Calculate scale reliably via JS Width / Base Card Width
          const scale = Math.max(0.1, containerWidth / 1280);

          return (
            <Card key={user.id} className="overflow-hidden shadow-sm relative group bg-muted/20">
              {/* Checkbox Overlay */}
              <div className="absolute top-3 left-3 z-20">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleSelect(user.id)}
                  className="h-5 w-5 rounded border-white/20 backdrop-blur-sm cursor-pointer accent-white"
                />
              </div>

              {/* Card Preview Container */}
              <div className="relative w-full aspect-[1.6] overflow-hidden">
                {/* Scaled Wrapper */}
                <div className="absolute inset-0 w-full h-full">
                   {/* Hover Overlay */}
                   <div className="absolute inset-0  backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center gap-4">
                      <Button 
                         size="icon" 
                         variant="secondary" 
                         className="h-12 w-12 rounded-full shadow-xl hover:scale-110 transition-transform"
                         title="Flip Card"
                         onClick={(e) => toggleFlip(user.id, e)}
                      >
                         <Repeat className="h-6 w-6" />
                      </Button>
                      <Button 
                         size="icon" 
                         variant="secondary" 
                         className="h-12 w-12 rounded-full shadow-xl hover:scale-110 transition-transform"
                         disabled={downloadingId === user.id}
                         onClick={(e) => handleDownload(user, e)}
                         title="Download Card"
                      >
                         {downloadingId === user.id ? (
                           <Loader2 className="h-6 w-6 animate-spin" />
                         ) : (
                           <Download className="h-6 w-6" />
                         )}
                      </Button>
                   </div>

                   <div 
                      className="absolute top-0 left-0 h-full transition-transform duration-500 will-change-transform ease-in-out"
                      style={{ 
                         width: "2620px",
                         transform: `scale(${scale}) translateX(${isFlipped ? '-1340px' : '0px'})`,
                         transformOrigin: "top left" 
                      }}
                   >
                       <div
                         style={{ width: "2620px", height: "800px" }}
                         className="w-[2620px] h-[800px]"
                       >
                         <CardDesignRenderer
                           frontRef={(el) => { frontRefs.current[user.id] = el; }}
                           backRef={(el) => { backRefs.current[user.id] = el; }}
                           cardUid={user.cardUid || "UNASSIGNED"}
                           user={user}
                           profile={user.profile}
                           templateUrl={user.company?.cardTemplateUrl || currentTemplateUrl}
                           logoUrl={user.company?.logoUrl || "/zyre_logo_with_text.png"}
                         />
                       </div>
                   </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
