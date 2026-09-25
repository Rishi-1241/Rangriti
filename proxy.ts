import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/lib/config";
import { SESSION } from "@/lib/constants";
import { verifySession } from "@/lib/auth/token";

function secretOrNull(): string | null {
  try {
    return authConfig().sessionSecret;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION.cookieName)?.value, secretOrNull());

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/studio", req.url)) : NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/studio/:path*", "/api/:path*"],
};
