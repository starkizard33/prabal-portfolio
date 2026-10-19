import { NextResponse, type NextRequest } from "next/server";

/**
 * Map play.starkizard.com → /play (and keep /play working on the apex too).
 * Local: play.localhost:3000 also rewrites.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const isPlayHost =
    host.startsWith("play.") ||
    host.startsWith("play.localhost") ||
    host === "play.starkizard.com";

  if (!isPlayHost) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/play") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/data") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/play" : `/play${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
