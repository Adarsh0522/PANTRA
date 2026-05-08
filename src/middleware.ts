import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');
  const isOnboardingRoute = nextUrl.pathname.startsWith('/onboarding');

  // Protect /dashboard — redirect to login (root) if not authenticated
  if (isDashboardRoute && !isLoggedIn) {
     return NextResponse.redirect(new URL('/', nextUrl));
  }

  // If user is logged in
  if (isLoggedIn) {
     // Ensure TypeScript knows it exists, auth handles this mapping. 
     // Note: if user.mobile_number doesn't trickle down properly, you may need a DB query here,
     // but we augmented it in the session callback.
     const hasMobile = !!(req.auth?.user as any)?.mobile_number;
     
     // Redirect to onboarding if accessing dashboard without mobile number
     if (isDashboardRoute && !hasMobile) {
         return NextResponse.redirect(new URL('/onboarding', nextUrl));
     }
     
     // Redirect away from onboarding if they already have a mobile number
     if (isOnboardingRoute && hasMobile) {
         return NextResponse.redirect(new URL('/dashboard', nextUrl));
     }
  }

  return NextResponse.next();
});

// Optionally specify matcher to avoid invoking middleware for static files
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
