import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function middleware(request: NextRequest) {
  // Auth0 middleware handles all /auth/* routes automatically
  const authRes = await auth0.middleware(request);

  // For auth routes, just return the auth response
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  // Check if the route is protected (author routes)
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/author");
  
  if (isProtectedRoute) {
    // Check for Auth0 session
    const session = await auth0.getSession(request);
    
    // Also check for our custom session cookie
    const customSessionCookie = request.cookies.get("lms_user_id");
    
    if (!session && !customSessionCookie) {
      // Redirect to our login page
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return authRes;
}

export const config = {
  matcher: [
    // Match auth routes
    "/auth/:path*",
    // Match author routes
    "/author/:path*",
  ],
};
