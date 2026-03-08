"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";

const accountSchema = z.object({
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal('')),
  confirmNewPassword: z.string().optional()
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword !== data.confirmNewPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  initialEmail: string;
}

export function AccountForm({ initialEmail }: AccountFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcePasswordChange = searchParams.get("forcePasswordChange") === "true";
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: initialEmail,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (values: AccountFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          currentPassword: values.currentPassword || undefined,
          newPassword: values.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update account settings");
      }

      toast.success("Account settings updated successfully!");
      form.reset({
        email: values.email,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border border-primary/20 bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>Login Credentials</CardTitle>
        <CardDescription>
          Update your email address or change your password. 
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {forcePasswordChange && (
          <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Password Change Required</AlertTitle>
            <AlertDescription>
              For security reasons, you must change your password before you can continue using the platform.
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(
              onSubmit, 
              (errors) => console.log("Account Form Errors:", errors)
            )} 
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="your.email@example.com" />
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Leave these fields blank if you do not wish to change your password.
              </p>
              
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          {...field} 
                          type={showCurrentPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="pr-10"
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10 text-muted-foreground"
                        tabIndex={-1}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setShowCurrentPassword((prev) => !prev);
                        }}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              {...field} 
                              type={showNewPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pr-10"
                            />
                          </FormControl>
                          <button
                            type="button"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10 text-muted-foreground"
                            tabIndex={-1}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setShowNewPassword((prev) => !prev);
                            }}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              {...field} 
                              type={showConfirmNewPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pr-10"
                            />
                          </FormControl>
                          <button
                            type="button"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10 text-muted-foreground"
                            tabIndex={-1}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setShowConfirmNewPassword((prev) => !prev);
                            }}
                          >
                            {showConfirmNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="flex-1 rounded-full border-primary/20 hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
