import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const isApi = request.nextUrl.pathname.startsWith("/api");
    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
    const baseUrl = request.nextUrl.origin;

    if (!token) {
      if (isApi) {
        return NextResponse.json({ error: "Missing token" }, { status: 401 });
      }

      if (!isAuthPage) {
        return NextResponse.redirect(`${baseUrl}/auth/login`);
      }

      return NextResponse.next();
    }

    const res = await fetch(`${baseUrl}/api/auth/token/valid`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (isApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!isAuthPage) {
        return NextResponse.redirect(`${baseUrl}/auth/login`);
      }

      return NextResponse.next();
    }

    if (isAuthPage) {
      return NextResponse.redirect(`${baseUrl}/dashboard`);
    }

    const { user_id, role, role_id } = await res.json();

    const response = NextResponse.next();
    if (isApi) {
      response.headers.set("x-user-id", user_id);
      response.headers.set("x-role", role);
      response.headers.set("x-role-id", role_id);
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
    "/api/user/:path*",
    "/auth/:path*",
    "/dashboard/:path*",
    "/api/orders/:path*",
    "/api/products/:path*",
  ],
};
