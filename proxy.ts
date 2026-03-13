// proxy.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/forgot-password") || 
                     req.nextUrl.pathname.startsWith("/reset-password");
  const isPublicProfile = req.nextUrl.pathname.startsWith("/profile/");
  const isCardRedirect = req.nextUrl.pathname.startsWith("/card/");
  const isInvitePage = req.nextUrl.pathname.startsWith("/invite/");
  const isScannerPage = req.nextUrl.pathname.startsWith("/scanner");
  
  if (isAuthPage) {
    if (isLoggedIn) {
      const userRole = (req.auth?.user as any)?.role;
      const redirectUrl = userRole === "ADMIN" ? "/admin" : "/dashboard";
      return Response.redirect(new URL(redirectUrl, req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicProfile && !isCardRedirect && !isInvitePage && !isScannerPage && req.nextUrl.pathname !== "/") {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
