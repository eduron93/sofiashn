import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

// Todos los paneles disponibles (super admin los tiene todos)
const ALL_PERMISSIONS = [
  "dashboard","productos","categorias","marcas","pedidos",
  "clientes","cupones","resenas","banners","inventario","reportes",
  "blog","configuracion","usuarios",
];

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    let permissions: string[] = [];
    let isSuperAdmin = false;
    let tokenEmail = email;

    // 1. Intentar con admin_users de la DB
    try {
      const { prisma } = await import("@/lib/prisma");
      const adminUser = await prisma.adminUser.findUnique({ where: { email } });
      if (adminUser && adminUser.isActive) {
        const bcrypt = await import("bcryptjs");
        const valid = await bcrypt.default.compare(password, adminUser.password);
        if (!valid) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
        // Si tenía casi todos los permisos (le faltan solo los añadidos recientemente), darle todos
        const stored = adminUser.permissions;
        if (stored.length >= ALL_PERMISSIONS.length - 2) {
          permissions = ALL_PERMISSIONS;
          // Persistir en DB si faltan permisos nuevos
          if (stored.length < ALL_PERMISSIONS.length) {
            await prisma.adminUser.update({
              where: { id: adminUser.id },
              data: { permissions: ALL_PERMISSIONS },
            });
          }
        } else {
          permissions = stored;
        }
        tokenEmail = adminUser.email;
      } else if (adminUser && !adminUser.isActive) {
        return NextResponse.json({ error: "Usuario desactivado" }, { status: 401 });
      } else {
        // 2. Fallback: super admin de variables de entorno
        const validEmail = process.env.ADMIN_EMAIL;
        const validPassword = process.env.ADMIN_PASSWORD;
        if (!validEmail || !validPassword) {
          return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
        }
        if (email !== validEmail || password !== validPassword) {
          return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
        }
        permissions = ALL_PERMISSIONS;
        isSuperAdmin = true;
      }
    } catch {
      // Si falla la DB, intentar con env vars
      const validEmail = process.env.ADMIN_EMAIL;
      const validPassword = process.env.ADMIN_PASSWORD;
      if (!validEmail || !validPassword || email !== validEmail || password !== validPassword) {
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      }
      permissions = ALL_PERMISSIONS;
      isSuperAdmin = true;
    }

    const token = await new SignJWT({ role: "ADMIN", email: tokenEmail, permissions, isSuperAdmin })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(getSecret());

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-token", "", { maxAge: 0, path: "/" });
  return res;
}
