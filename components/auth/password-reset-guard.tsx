"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function PasswordResetGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.mustChangePassword) {
      // Allow them to stay on the account settings page to change their password
      if (pathname !== "/account") {
        router.push("/account?forcePasswordChange=true");
      }
    }
  }, [session, status, pathname, router]);

  // If they must change password and they are NOT on the account page,
  // we could potentially show a lock screen or just let the redirect happen.
  // Letting the redirect happen is smoother.
  
  return <>{children}</>;
}
