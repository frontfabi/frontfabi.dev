import { NextResponse, type NextRequest } from "next/server";
import { locales, parsePath } from "@/lib/site";
export function proxy(request: NextRequest) {
  const { locale } = parsePath(
    request.nextUrl.pathname.split("/").filter(Boolean),
  );
  const headers = new Headers(request.headers);
  headers.set("x-site-locale", locales[locale]);
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: [
    "/((?!api|_next|icons|fonts|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
