import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function getUserId(req: NextRequest): string | null {
  try {
    const token = req.cookies.get("velora-token")?.value;
    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET || "velora-jwt-secret") as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { prisma } = await import("@/lib/prisma");
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { name, phone, street, city, state, zipCode, country, isDefault } = body;

  if (!name || !phone || !street || !city || !state || !zipCode) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { userId, name, phone, street, city, state, zipCode, country: country || "Honduras", isDefault: !!isDefault },
  });

  return NextResponse.json({ address }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { prisma } = await import("@/lib/prisma");
  await prisma.address.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
