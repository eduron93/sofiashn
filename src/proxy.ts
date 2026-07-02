import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pasar pathname como header para que el layout lo lea
  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);

  if (!pathname.startsWith("/admin")) return res;
  if (pathname === "/admin/login") return res;

  const token = req.cookies.get("admin-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)"],
};
