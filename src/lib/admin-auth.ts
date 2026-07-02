import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export interface AdminPayload extends JWTPayload {
  role: string;
  email: string;
  permissions: string[];
  isSuperAdmin?: boolean;
}

export async function verifyAdminRequest(req: NextRequest): Promise<NextResponse | null> {
  try {
    const token = req.cookies.get("admin-token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { payload } = await jwtVerify(token, getSecret());
    if ((payload as AdminPayload).role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    return null;
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function getAdminPayload(req: NextRequest): Promise<AdminPayload | null> {
  try {
    const token = req.cookies.get("admin-token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    if ((payload as AdminPayload).role !== "ADMIN") return null;
    return payload as AdminPayload;
  } catch {
    return null;
  }
}
