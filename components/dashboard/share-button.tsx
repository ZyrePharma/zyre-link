"use client";

import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface ShareButtonProps {
  username: string;
  name: string;
}

export function ShareButton({ username, name }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.protocol}//${window.location.host}/profile/${username}`
    : "";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}'s Digital Business Card`,
          text: `Check out my digital business card on Zyre Link!`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Profile link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link.");
      }
    }
  };

  return (
    <Button 
      size="sm" 
      onClick={handleShare}
      className="text-xs md:text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90"
    >
      {copied ? (
        <Check className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
      ) : (
        <Share2 className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
      )}
      {copied ? "Copied!" : "Share Profile"}
    </Button>
  );
}
