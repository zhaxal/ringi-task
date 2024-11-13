import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const isApi = request.nextUrl.pathname.startsWith("/api");
    const baseUrl = request.nextUrl.origin;

    if (!token) {
      if (isApi) {
        return NextResponse.json({ error: "Missing token" }, { status: 401 });
      }
      return NextResponse.next();
    }

    // Validate token
    const res = await fetch(`${baseUrl}/api/auth/token/valid`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle token validation results
    if (!res.ok) {
      if (isApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.next();
    }

    // Handle authenticated users
    const { user_id } = await res.json();

    const response = NextResponse.next();
    if (isApi) {
      response.headers.set("x-user-id", user_id);
    }
    return response;

  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/api/user/:path*'
  ]
};