"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isValid = token && password.length >= 8 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setDone(true);
      toast.success("Account activated! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-destructive">Invalid Invite</h1>
          <p className="text-muted-foreground">This invite link is missing or malformed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden">
        {/* Header bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0f1c48] to-[#c0392b]" />

        <div className="p-8 space-y-6">
          {done ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Account Activated!</h2>
              <p className="text-muted-foreground">You'll be redirected to login shortly...</p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-2">
                  <KeyRound className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Set Your Password</h1>
                <p className="text-sm text-muted-foreground">
                  Create a secure password to activate your <span className="font-bold text-primary">Zyre Link</span> account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl border-primary/20 bg-background focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="h-11 rounded-xl border-primary/20 bg-background focus-visible:ring-primary"
                  />
                  {confirm && password !== confirm && (
                    <p className="text-xs text-destructive">Passwords do not match.</p>
                  )}
                  {confirm && password.length < 8 && (
                    <p className="text-xs text-destructive">Password must be at least 8 characters.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full h-11 rounded-xl font-bold shadow-lg bg-primary hover:bg-primary/90 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    "Activate Account"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Zyre Pharmaceuticals. All rights reserved.
      </p>
    </div>
  );
}
