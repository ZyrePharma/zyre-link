"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, QrCode, RefreshCw } from "lucide-react";
import QRCode from "qrcode";

export function ScannerQRCodeDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const generateToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/scanner-token", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate token");
      }

      const data = await response.json();
      setToken(data.token);
      setExpiresAt(new Date(data.expires));

      const baseUrl = window.location.origin;
      const scannerUrl = `${baseUrl}/admin/cards/scanner?token=${data.token}`;
      
      const qrCodeUrl = await QRCode.toDataURL(scannerUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      
      setQrDataUrl(qrCodeUrl);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !qrDataUrl) {
      generateToken();
    }
  }, [open, qrDataUrl, generateToken]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl shadow-lg hover:bg-secondary/10 active:scale-95 transition-all">
          <QrCode className="h-4 w-4 mr-2" /> Open Mobile Scanner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Mobile Card Scanner</DialogTitle>
          <DialogDescription>
            Scan this QR code with a mobile device (Android/Chrome recommended) to start registering NFC cards.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {isLoading ? (
            <div className="w-[300px] h-[300px] flex items-center justify-center bg-muted/30 rounded-2xl border-2 border-dashed border-primary/20">
              <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
            </div>
          ) : qrDataUrl ? (
            <div className="relative group">
              <img 
                src={qrDataUrl} 
                alt="Scanner QR Code" 
                className="rounded-2xl shadow-xl border-4 border-white dark:border-zinc-800"
              />
              <div className="absolute inset-0 bg-black/5 rounded-2xl pointer-events-none" />
            </div>
          ) : (
            <div className="w-[300px] h-[300px] flex items-center justify-center bg-muted/30 rounded-2xl border-2 border-dashed border-primary/20">
               <Button onClick={generateToken} variant="ghost" className="h-full w-full rounded-2xl">
                 Click to Generate
               </Button>
            </div>
          )}

          {expiresAt && (
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Token Security Active
              </p>
              <p className="text-[10px] text-muted-foreground/80">
                Expires: {expiresAt.toLocaleTimeString()}
              </p>
            </div>
          )}

          <Button 
            onClick={generateToken} 
            disabled={isLoading}
            variant="outline" 
            size="sm"
            className="rounded-xl"
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate Token
          </Button>
        </div>

        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <h4 className="text-sm font-semibold text-primary mb-1">How it works:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>Scan with a mobile device to open the scanner page.</li>
            <li>Grant NFC permissions when prompted.</li>
            <li>Tap a new NFC card to the back of the device.</li>
            <li>The card will be automatically registered and formatted.</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
