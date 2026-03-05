"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export function RegisterCardDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardUid: serialNumber }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register card");
      }

      toast.success("Card registered successfully!");
      setOpen(false);
      setSerialNumber("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
          <Plus className="h-4 w-4 mr-2" /> Register New Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <form onSubmit={handleRegister}>
          <DialogHeader>
            <DialogTitle>Register NFC Card</DialogTitle>
            <DialogDescription>
              Enter the unique serial number printed on the back of the physical card.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Card Serial Number</Label>
              <Input
                id="serialNumber"
                placeholder="e.g. ZYRE-00123"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                autoFocus
                className="rounded-xl h-11 border-primary/20 bg-background focus-visible:ring-primary/20"
                disabled={isLoading}
              />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">
              Note: An activation code will be auto-generated securely.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20" 
              disabled={isLoading || !serialNumber}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Card"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
