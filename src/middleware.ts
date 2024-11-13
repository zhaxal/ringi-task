import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    const isApi = request.nextUrl.pathname.startsWith("/api");

    if (isApi && !token)
      return NextResponse.json({ error: "Missing token" }, { status: 400 });

    if (!isApi && !token)
      return NextResponse.redirect(new URL("/", request.url));

    const baseUrl = request.nextUrl.origin;

    const res = await fetch(`${baseUrl}/api/auth/token/valid`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (isApi && !res.ok)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isApi && !res.ok)
      return NextResponse.redirect(new URL("/", request.url));

    const { user_id } = await res.json();
    const response = NextResponse.next();

    if (isApi) response.headers.set("x-user-id", user_id);

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.error();
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/api/user/:path*"],
};
