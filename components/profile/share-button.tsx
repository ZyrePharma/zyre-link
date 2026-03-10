"use client";

import { Share } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  username: string;
  hasBannerImage: boolean;
}

export function ShareButton({ username, hasBannerImage }: ShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title: "Zyre Link Profile",
      text: `Check out my digital business card!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard!");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error sharing:", err);
        // Fallback to clipboard if share fails
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard!");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "absolute top-4 right-4 p-2.5 rounded-xl transition-all active:scale-95 z-10 shadow-sm backdrop-blur-md",
        hasBannerImage 
          ? "bg-black/20 text-white" 
          : "bg-gray-100 text-gray-700"
      )}
      title="Share Profile"
    >
      <Share className="h-5 w-5" />
    </button>
  );
}
