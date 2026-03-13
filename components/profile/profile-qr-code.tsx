"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface ProfileQRCodeProps {
  url: string;
  size?: number;
  className?: string;
  luxuryColor?: string;
}

export function ProfileQRCode({ url, size = 200, className, luxuryColor }: ProfileQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: size * 2,
      margin: 1,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [url, size]);

  return (
    <div 
      className={cn(
        "bg-white p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100 relative group overflow-hidden flex items-center justify-center",
        className
      )} 
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {qrDataUrl ? (
        <img src={qrDataUrl} alt="QR Code" className="w-full h-full opacity-90 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
      ) : (
        <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
      )}
      
      {luxuryColor && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l opacity-20" style={{ borderColor: luxuryColor }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r opacity-20" style={{ borderColor: luxuryColor }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l opacity-20" style={{ borderColor: luxuryColor }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r opacity-20" style={{ borderColor: luxuryColor }} />
        </>
      )}
    </div>
  );
}
