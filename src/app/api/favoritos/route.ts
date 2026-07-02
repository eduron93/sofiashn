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

// GET — devuelve los IDs de favoritos del usuario
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ ids: [] });

  try {
    const { prisma } = await import("@/lib/prisma");
    const favs = await prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    return NextResponse.json({ ids: favs.map((f) => f.productId) });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}

// POST — toggle favorito (agrega o elimina)
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { productId } = await req.json();
    const { prisma } = await import("@/lib/prisma");

    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { userId_productId: { userId, productId } } });
      return NextResponse.json({ action: "removed" });
    } else {
      await prisma.favorite.create({ data: { userId, productId } });
      return NextResponse.json({ action: "added" });
    }
  } catch {
    return NextResponse.json({ error: "Error al actualizar favorito" }, { status: 500 });
  }
}
