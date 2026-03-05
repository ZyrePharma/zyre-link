// proxy.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isPublicProfile = req.nextUrl.pathname.startsWith("/profile/");
  const isNFCHandler = req.nextUrl.pathname.startsWith("/n/");
  const isCardRedirect = req.nextUrl.pathname.startsWith("/card/");
  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicProfile && !isNFCHandler && !isCardRedirect && req.nextUrl.pathname !== "/") {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
