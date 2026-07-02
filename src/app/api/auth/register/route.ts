import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "CUSTOMER" },
      select: { id: true, name: true, email: true },
    });

    // Enviar email de bienvenida (sin bloquear la respuesta)
    if (process.env.RESEND_API_KEY) {
      const { sendWelcomeEmail } = await import("@/lib/resend");
      sendWelcomeEmail(email, name).catch(() => {});
    }

    return NextResponse.json({ user, success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 });
  }
}
