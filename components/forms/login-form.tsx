"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border border-primary/20 bg-card text-card-foreground light">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-3xl font-bold text-center tracking-tight">Login</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your company email to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* <div className="grid grid-cols-1 ">
          <Button variant="outline" onClick={() => handleSSOLogin("google")}>
            <Mail className="mr-2 h-4 w-4" />
            Login with Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div> */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl focus:ring-primary/20"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button 
                type="button"
                variant="link" 
                size="sm" 
                className="px-0 font-normal"
                onClick={() => router.push("/forgot-password")}
              >
                Forgot password?
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10 rounded-xl focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <Button type="submit" className="w-full rounded-xl h-11 font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
