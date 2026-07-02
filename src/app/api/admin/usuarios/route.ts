import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, getAdminPayload } from "@/lib/admin-auth";

const ALL_PERMISSIONS = [
  "dashboard","productos","categorias","marcas","pedidos",
  "clientes","cupones","resenas","banners","inventario","reportes",
  "blog","configuracion","usuarios",
];

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.default.hash(password, 10);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.default.compare(password, hash);
}

async function requireSuperOrUsuarios(req: NextRequest) {
  const authErr = await verifyAdminRequest(req);
  if (authErr) return authErr;
  const payload = await getAdminPayload(req);
  if (!payload?.isSuperAdmin && !payload?.permissions?.includes("usuarios")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const err = await requireSuperOrUsuarios(req);
  if (err) return err;
  try {
    const { prisma } = await import("@/lib/prisma");
    const users = await prisma.adminUser.findMany({
      select: { id: true, name: true, email: true, permissions: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (e) {
    console.error("GET /api/admin/usuarios:", e);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const err = await requireSuperOrUsuarios(req);
  if (err) return err;
  try {
    const { name, email, password, permissions } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }
    const perms = Array.isArray(permissions)
      ? permissions.filter((p: unknown) => typeof p === "string" && ALL_PERMISSIONS.includes(p))
      : [];

    const hashed = await hashPassword(password);
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.adminUser.create({
      data: { name: String(name).slice(0, 100), email, password: hashed, permissions: perms },
      select: { id: true, name: true, email: true, permissions: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e: unknown) {
    console.error("POST /api/admin/usuarios:", e);
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const err = await requireSuperOrUsuarios(req);
  if (err) return err;
  try {
    const { id, name, email, password, permissions, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name).slice(0, 100);
    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Email inválido" }, { status: 400 });
      }
      data.email = email;
    }
    if (password !== undefined && password !== "") {
      if (password.length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
      }
      data.password = await hashPassword(password);
    }
    if (permissions !== undefined) {
      data.permissions = Array.isArray(permissions)
        ? permissions.filter((p: unknown) => typeof p === "string" && ALL_PERMISSIONS.includes(p))
        : [];
    }
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.adminUser.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, permissions: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    console.error("PATCH /api/admin/usuarios:", e);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const err = await requireSuperOrUsuarios(req);
  if (err) return err;
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/usuarios:", e);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
