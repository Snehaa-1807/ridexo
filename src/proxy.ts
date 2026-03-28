import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";

const PUBLIC_ROUTES = ["/"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Public APIs
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = session.user?.role;

  // ✅ Partner onboarding allowed for everyone logged in
  if (pathname.startsWith("/partner/onboarding")) {
    return NextResponse.next();
  }

  // ❌ Restrict other partner routes
  if (pathname.startsWith("/partner") && role !== "partner") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Admin routes
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // API protection
  if (pathname.startsWith("/api") && !session ||  !session.user) {
    return NextResponse.json(
      { message: "unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};