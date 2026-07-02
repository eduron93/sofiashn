import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest) {
  const authErr = await verifyAdminRequest(req);
  if (authErr) return authErr;
  try {
    const { id, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: { id: true, isActive: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    console.error("PATCH /api/admin/clientes:", e);
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authErr = await verifyAdminRequest(req);
  if (authErr) return authErr;
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/clientes:", e);
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}
