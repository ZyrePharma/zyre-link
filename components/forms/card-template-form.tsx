"use client";

import { useState, useRef } from "react";
import { Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CardTemplateFormProps {
  initialTemplateUrl: string | null;
  onSave: (url: string | null) => void;
  onCancel: () => void;
}

export function CardTemplateForm({ initialTemplateUrl, onSave, onCancel }: CardTemplateFormProps) {
  const [currentUrl, setCurrentUrl] = useState(initialTemplateUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
      setCurrentUrl(data.url);
      toast.success("Template uploaded! Click Save to apply.");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      // eslint-disable-next-line @next/next/no-img-element
      if (e.target) e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardTemplateUrl: currentUrl }),
      });
      
      if (!res.ok) throw new Error("Failed to save template");
      toast.success("Template saved successfully");
      onSave(currentUrl);
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 py-4">
        {/* Preview */}
        <div className="space-y-2">
          <Label>Current Template Preview</Label>
          {currentUrl ? (
            <div className="relative w-full aspect-[1.6] rounded-xl overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentUrl} 
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
            disabled={isUploading}
            className="gap-2 w-full rounded-xl h-11"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {currentUrl ? "Change Image" : "Upload Image"}
          </Button>
          
          <div className="space-y-2">
            <Label>Or Image URL</Label>
            <Input 
              value={currentUrl || ""}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl h-11 font-bold" disabled={isSaving || isUploading}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Save Design
        </Button>
      </div>
    </form>
  );
}
