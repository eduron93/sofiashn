import { NextRequest, NextResponse } from "next/server";
import { getAdminPayload } from "@/lib/admin-auth";

const ALL_PERMISSIONS = [
  "dashboard","productos","categorias","marcas","pedidos",
  "clientes","cupones","resenas","banners","inventario","reportes",
  "blog","configuracion","usuarios",
];

export async function GET(req: NextRequest) {
  const payload = await getAdminPayload(req);
  if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Super admin de env vars — siempre ve todo
  if (payload.isSuperAdmin) {
    return NextResponse.json({ email: payload.email, permissions: null, isSuperAdmin: true });
  }

  // Usuario de DB — leer permisos frescos desde la DB para incluir los nuevos paneles
  try {
    const { prisma } = await import("@/lib/prisma");
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: payload.email },
      select: { permissions: true, isActive: true },
    });

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Si tiene casi todos los permisos, completar con los nuevos
    const stored = adminUser.permissions;
    const permissions = stored.length >= ALL_PERMISSIONS.length - 2
      ? ALL_PERMISSIONS
      : stored;

    return NextResponse.json({ email: payload.email, permissions, isSuperAdmin: false });
  } catch {
    // Fallback al JWT si falla la DB
    return NextResponse.json({
      email: payload.email,
      permissions: payload.permissions ?? [],
      isSuperAdmin: false,
    });
  }
}
