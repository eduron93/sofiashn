import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No hay sesión de Google activa" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "",
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("velora-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error al procesar sesión" }, { status: 500 });
  }
}
