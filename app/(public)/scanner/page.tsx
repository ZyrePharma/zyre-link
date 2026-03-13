"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Smartphone, CheckCircle2, AlertCircle, Scan } from "lucide-react";

function ScannerContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"initializing" | "ready" | "scanning" | "registering" | "success" | "error">("initializing");
  const [error, setError] = useState<string | null>(null);
  const [lastUid, setLastUid] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  const ndefRef = useRef<any>(null);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidToken(false);
        setStatus("error");
        setError("Missing security token");
        return;
      }

      try {
        const response = await fetch(`/api/admin/scanner-token?token=${token}`);
        const data = await response.json();
        setIsValidToken(data.valid);
        if (data.valid) {
          setStatus("ready");
        } else {
          setStatus("error");
          setError("Invalid or expired token");
        }
      } catch (err) {
        setIsValidToken(false);
        setStatus("error");
        setError("Failed to validate security token");
      }
    }

    validateToken();
  }, [token]);

  const startScanning = async () => {
    if (!("NDEFReader" in window)) {
      toast.error("Web NFC is not supported on this device/browser. Use Chrome on Android.");
      return;
    }

    try {
      setStatus("scanning");
      // @ts-ignore
      const ndef = new NDEFReader();
      ndefRef.current = ndef;
      await ndef.scan();
      
      ndef.addEventListener("reading", async ({ serialNumber }: any) => {
        setLastUid(serialNumber);
        handleRegistration(serialNumber);
      });

      ndef.addEventListener("readingerror", () => {
        toast.error("Cannot read data from the NFC tag. Try another one.");
      });

    } catch (err: any) {
      console.error(err);
      setStatus("ready");
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleRegistration = async (uid: string) => {
    setStatus("registering");
    try {
      // 1. Register with API
      const regResponse = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardUid: uid, token }),
      });

      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(errorData.error || "Failed to register card");
      }

      // 2. Format / Write NDEF record
      // We want to write the URL so it's ready for use
      try {
        const baseUrl = window.location.origin;
        const targetUrl = `${baseUrl}/card/${uid}?source=nfc`;
        
        await ndefRef.current.write({
          records: [{ recordType: "url", data: targetUrl }]
        });
        
        toast.success("Card registered and formatted successfully!");
      } catch (writeErr) {
        console.error("Write error:", writeErr);
        toast.warning("Registered but failed to write URL to card. You may need to format it manually.");
      }

      setStatus("success");
      setTimeout(() => setStatus("scanning"), 3000); // Back to scanning after 3 seconds
    } catch (err: any) {
      setError(err.message);
      setStatus("scanning");
      toast.error(err.message);
    }
  };

  if (status === "initializing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Initializing scanner...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-zinc-50 dark:bg-zinc-950">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Zyre NFC Scanner</CardTitle>
          <CardDescription>Automated Card Registration System</CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-8 pb-12">
          {status === "ready" && (
            <>
              <div className="text-center space-y-2 px-4">
                <p className="text-sm text-muted-foreground">
                  Ready to start scanning. Please ensure NFC is enabled on your device.
                </p>
              </div>
              <Button 
                onClick={startScanning} 
                className="w-full h-16 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
              >
                <Scan className="mr-2 h-6 w-6" /> Start Scanning
              </Button>
            </>
          )}

          {status === "scanning" && (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-primary animate-ping opacity-20" />
                  <Smartphone className="absolute h-16 w-16 text-primary animate-pulse" />
                </div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold">Scanning for Tags...</h3>
                <p className="text-sm text-muted-foreground">Tap an NFC card to the back of your phone</p>
              </div>
            </div>
          )}

          {status === "registering" && (
            <div className="flex flex-col items-center space-y-6">
              <Loader2 className="h-20 w-20 animate-spin text-primary" />
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold">Registering Card</h3>
                <p className="text-sm text-muted-foreground">UID: {lastUid}</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-300">
               <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-green-600">Card Registered!</h3>
                <p className="text-sm text-muted-foreground">Ready for the next one...</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-6 text-center px-4">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-destructive">Error</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full rounded-xl mt-4">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <p className="mt-8 text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">
        Zyre IT Security Protocol • Session Enabled
      </p>
    </div>
  );
}

export default function MobileScannerPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Initializing scanner...</p>
      </div>
    }>
      <ScannerContent />
    </Suspense>
  );
}
