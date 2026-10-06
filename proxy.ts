import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, getSessionUserId } from "@/lib/auth";

const PUBLIC = ["/login", "/api/login", "/api/login/members", "/api/logout", "/manifest.webmanifest"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const headers = new Headers(req.headers);
  headers.delete("x-user-id");
  if (PUBLIC.includes(pathname) || pathname.startsWith("/pwa-icon/")) return NextResponse.next({ request: { headers } });

  const userId = await getSessionUserId(req.cookies.get(SESSION_COOKIE)?.value);
  if (userId) {
    headers.set("x-user-id", userId);
    return NextResponse.next({ request: { headers } });
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const url = new URL("/login", req.url);
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
