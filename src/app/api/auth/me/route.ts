import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("velora-token")?.value;
    if (!token) return NextResponse.json({ user: null });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "velora-jwt-secret") as {
      id: string;
      email: string;
      role: string;
    };

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
