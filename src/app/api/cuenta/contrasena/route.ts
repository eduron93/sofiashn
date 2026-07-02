import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("velora-token")?.value;
    if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "velora-jwt-secret") as { id: string };
    const { currentPassword, newPassword } = await req.json();

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user?.password) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: payload.id }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al cambiar la contraseña" }, { status: 500 });
  }
}
