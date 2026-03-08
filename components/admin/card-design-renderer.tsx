"use client";

import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";

interface CardSideProps {
  cardUid: string;
  user?: { id: string; name: string | null; email: string } | null;
  profile?: { username: string | null; jobTitle?: string | null } | null;
  templateUrl: string | null;
  logoUrl?: string | null;
}

export const CardFront = forwardRef<HTMLDivElement, CardSideProps>(
  ({ templateUrl, logoUrl }, ref) => {
    return (
      <div 
        ref={ref}
        style={{ position: "relative", width: "1280px", height: "800px", backgroundColor: "white", overflow: "hidden", borderRadius: "30px", flexShrink: 0 }}
      >
        {/* Background Overlay */}
        {templateUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={templateUrl} alt="Background" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill" }} />
        )}

        {/* Foreground Company Logo */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={logoUrl || "/zyre_logo_with_text.png"} alt="Company Logo" style={{ width: "580px", height: "auto" }} />
        </div>
      </div>
    );
  }
);
CardFront.displayName = "CardFront";

export const CardBack = forwardRef<HTMLDivElement, CardSideProps>(
  ({ cardUid, user, profile, templateUrl }, ref) => {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");

    useEffect(() => {
      if (cardUid) {
        const cardUrl = `${window.location.origin}/card/${cardUid}?source=qr`;
        QRCode.toDataURL(cardUrl, { width: 300, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
          .then(setQrDataUrl)
          .catch(console.error);
      }
    }, [cardUid]);

    return (
      <div 
        ref={ref}
        style={{ position: "relative", width: "1280px", height: "800px", backgroundColor: "white", overflow: "hidden", borderRadius: "30px", flexShrink: 0, fontFamily: "'Inter', sans-serif" }}
      >
        {/* Background Overlay */}
        {templateUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={templateUrl} alt="Background" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill" }} />
        )}

        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 120px" }}>
          {/* User Name */}
          <div style={{ flex: 1, paddingRight: "50px" }}>
             {user?.name ? (
                <h2 style={{ fontSize: "68px", fontWeight: 700, color: "#1a1a1a", margin: 0, lineHeight: 1.2 }}>
                   {user.name}
                </h2>
             ) : (
                <span style={{ fontSize: "52px", fontStyle: "italic", color: "#666" }}>Unassigned</span>
             )}
          </div>

           {/* QR Code Segment */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "25px" }}>
             {qrDataUrl && (
                <div style={{ width: "300px", height: "300px", backgroundColor: "white", padding: "12px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="QR Code" style={{ width: "100%", height: "100%" }} />
                </div>
             )}
             <div style={{ marginTop: "16px", fontSize: "36px", fontWeight: 600, letterSpacing: "10px", color: "#1a1a1a", marginLeft: "15px" }}>
               ZYRE LINK
             </div>
          </div>
        </div>

       
      </div>
    );
  }
);
CardBack.displayName = "CardBack";

interface CardDesignProps extends CardSideProps {
  frontRef?: React.Ref<HTMLDivElement>;
  backRef?: React.Ref<HTMLDivElement>;
}

export const CardDesignRenderer = ({ cardUid, user, profile, templateUrl, logoUrl, frontRef, backRef }: CardDesignProps) => {
  return (
    <div 
      className="relative overflow-hidden bg-transparent flex"
      style={{
        width: "2620px", /* Two 1280px cards + 60px gap */
        height: "800px",
        boxSizing: "border-box",
        gap: "60px",
      }}
    >
      <CardFront ref={frontRef} templateUrl={templateUrl} logoUrl={logoUrl} cardUid={cardUid} user={user} profile={profile} />
      <CardBack ref={backRef} cardUid={cardUid} user={user} profile={profile} templateUrl={templateUrl} />
    </div>
  );
};
